export interface MarketplacePurchasePayload {
  action: "purchased" | "changed" | "cancelled";
  marketplace_purchase: {
    account: {
      id: number;
      login: string;
      type: "User" | "Organization";
    };
    plan: {
      id: number;
      name: string;
      monthly_price_in_cents: number;
    };
  };
  previous_marketplace_purchase?: {
    plan: {
      id: number;
      name: string;
      monthly_price_in_cents: number;
    };
  };
}

export interface PurchaseRecordData {
  organizationId: string;
  action: string;
  account: { id: number; login: string; type: string };
  plan: { id: number; name: string; monthly_price_in_cents: number };
  previousPlan?: { id: number; name: string; monthly_price_in_cents: number };
}
