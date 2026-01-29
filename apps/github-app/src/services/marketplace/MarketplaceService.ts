import { Context } from "probot";
import { logger } from "@/utils/logger";
import { SupabaseService } from "@/services/database/SupabaseService";
import type {
  MarketplacePurchasePayload,
  PurchaseRecordData,
  Organization,
} from "@/types";

/**
 * MarketplaceService - Handles GitHub Marketplace purchase events
 * 
 * Responsibilities:
 * - Process marketplace purchase, change, and cancellation events
 * - Record purchase history in database
 * - Update organization plan information
 * 
 * Note: Initial 10 credits are given on signup via database trigger,
 * not during marketplace purchase.
 */
export class MarketplaceService {
  private db: SupabaseService;

  constructor() {
    this.db = SupabaseService.getInstance();
  }

  /**
   * Main handler for marketplace purchase events
   * Orchestrates the entire purchase flow
   */
  async handleMarketplacePurchase(
    context: Context<
      | "marketplace_purchase.purchased"
      | "marketplace_purchase.changed"
      | "marketplace_purchase.cancelled"
    >
  ): Promise<void> {
    const payload = context.payload as MarketplacePurchasePayload;
    const { action, marketplace_purchase, previous_marketplace_purchase } =
      payload;
    const { account, plan } = marketplace_purchase;

    logger.info("Processing marketplace purchase", {
      action,
      accountId: account.id,
      accountType: account.type,
      accountLogin: account.login,
      planName: plan.name,
      monthlyPriceInCents: plan.monthly_price_in_cents,
    });

    try {
      // Find the organization by GitHub account ID
      const organization = await this.findOrganizationByGithubId(
        account.id.toString()
      );

      if (!organization) {
        const error = `Organization not found for account ${account.login}`;
        logger.error("Organization not found for marketplace purchase", {
          accountId: account.id,
          accountLogin: account.login,
        });
        throw new Error(error);
      }

      // Record the purchase in database
      await this.recordPurchase({
        organizationId: organization.id,
        action,
        account,
        plan,
        previousPlan: previous_marketplace_purchase?.plan,
      });

      // Add credits for purchased plan
      if (action === "purchased") {
        await this.addPlanCredits(organization.id, plan);
      }

      // Update organization's current plan
      await this.updateOrganizationPlan(
        organization.id,
        action === "cancelled" ? null : plan.name
      );

      logger.info("Marketplace purchase processed successfully", {
        organizationId: organization.id,
        action,
        planName: plan.name,
      });
    } catch (error: any) {
      logger.error("Failed to process marketplace purchase", {
        error: error.message,
        stack: error.stack,
        accountId: account.id,
      });
      throw error;
    }
  }

  /**
   * Find organization by GitHub account ID
   */
  private async findOrganizationByGithubId(
    githubAccountId: string
  ): Promise<Organization | null> {
    logger.debug("Finding organization by GitHub ID", { githubAccountId });

    const client = this.db.getClient();
    const { data, error } = await client
      .from("organizations")
      .select("*")
      .eq("github_org_id", githubAccountId)
      .single();

    if (error) {
      logger.error("Failed to find organization", {
        githubAccountId,
        error: error.message,
      });
      return null;
    }

    logger.debug("Organization found", {
      githubAccountId,
      organizationId: data?.id,
    });

    return data as Organization;
  }

  /**
   * Records a marketplace purchase in the database
   */
  private async recordPurchase(data: PurchaseRecordData): Promise<void> {
    const { organizationId, action, account, plan, previousPlan } = data;

    logger.debug("Recording marketplace purchase", {
      organizationId,
      action,
      planName: plan.name,
    });

    const client = this.db.getClient();
    const { error } = await client.from("marketplace_purchases").insert({
      organization_id: organizationId,
      github_account_id: account.id.toString(),
      github_account_login: account.login,
      github_account_type: account.type,
      action,
      plan_name: plan.name,
      plan_id: plan.id.toString(),
      monthly_price_in_cents: plan.monthly_price_in_cents,
      previous_plan_name: previousPlan?.name || null,
      previous_monthly_price_in_cents:
        previousPlan?.monthly_price_in_cents || null,
      marketplace_purchase_data: JSON.stringify({
        plan,
        previousPlan,
        account,
      }),
      purchased_at: new Date().toISOString(),
    });

    if (error) {
      logger.error("Failed to record marketplace purchase", {
        error: error.message,
        organizationId,
      });
      throw error;
    }

    logger.info("Marketplace purchase recorded", {
      organizationId,
      action,
      planName: plan.name,
    });
  }

  /**
   * Update organization's current plan
   */
  private async updateOrganizationPlan(
    organizationId: string,
    planName: string | null
  ): Promise<void> {
    logger.debug("Updating organization plan", {
      organizationId,
      planName,
    });

    const client = this.db.getClient();
    const { error } = await client
      .from("organizations")
      .update({
        current_plan_name: planName,
      })
      .eq("id", organizationId);

    if (error) {
      logger.error("Failed to update organization plan", {
        organizationId,
        planName,
        error: error.message,
      });
      throw error;
    }

    logger.info("Organization plan updated", {
      organizationId,
      planName,
    });
  }

  /**
   * Add credits based on purchased plan
   * Conversion: plan price (cents) / 100 = USD, then USD * 10 = credits
   * E.g., $5/month plan = 50 credits
   */
  private async addPlanCredits(
    organizationId: string,
    plan: { id: number; name: string; monthly_price_in_cents: number }
  ): Promise<void> {
    logger.debug("Adding plan credits", {
      organizationId,
      planName: plan.name,
      monthlyPriceInCents: plan.monthly_price_in_cents,
    });

    // Calculate credits: price in USD * 10
    // E.g., $5.00 = 500 cents = 50 credits
    const priceInUSD = plan.monthly_price_in_cents / 100;
    const creditsToAdd = priceInUSD * 10;

    if (creditsToAdd <= 0) {
      logger.warn("Plan has zero or negative price, skipping credit addition", {
        organizationId,
        planName: plan.name,
        monthlyPriceInCents: plan.monthly_price_in_cents,
      });
      return;
    }

    const client = this.db.getClient();

    // Get current balance
    const { data: org, error: orgError } = await client
      .from("organizations")
      .select("credit_balance")
      .eq("id", organizationId)
      .single();

    if (orgError || !org) {
      logger.error("Failed to get organization for credit addition", {
        organizationId,
        error: orgError?.message,
      });
      throw orgError || new Error("Organization not found");
    }

    const currentBalance = parseFloat(org.credit_balance);
    const newBalance = currentBalance + creditsToAdd;

    // Update balance
    const { error: updateError } = await client
      .from("organizations")
      .update({ credit_balance: newBalance.toFixed(2) })
      .eq("id", organizationId);

    if (updateError) {
      logger.error("Failed to update credit balance", {
        organizationId,
        error: updateError.message,
      });
      throw updateError;
    }

    // Record transaction
    const { error: txError } = await client.from("credit_transactions").insert({
      organization_id: organizationId,
      transaction_type: "purchase",
      amount: creditsToAdd.toFixed(2),
      balance_after: newBalance.toFixed(2),
      reference_type: "marketplace_purchase",
      reference_id: plan.id.toString(),
      metadata: JSON.stringify({
        planName: plan.name,
        planId: plan.id,
        monthlyPriceInCents: plan.monthly_price_in_cents,
        priceInUSD,
        creditsAdded: creditsToAdd,
      }),
    });

    if (txError) {
      logger.error("Failed to record credit transaction", {
        organizationId,
        error: txError.message,
      });
      throw txError;
    }

    logger.info("Plan credits added", {
      organizationId,
      planName: plan.name,
      creditsAdded: creditsToAdd,
      previousBalance: currentBalance,
      newBalance,
    });
  }
}
