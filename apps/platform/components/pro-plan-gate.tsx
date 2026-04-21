"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@thinkthroo/ui/components/button";
import { Badge } from "@thinkthroo/ui/components/badge";
import { Switch } from "@thinkthroo/ui/components/switch";
import { PricingFeatureList } from "@thinkthroo/ui/components/pricing-feature-list";
import { freeFeatures, proFeatures, pricing } from "@thinkthroo/ui/lib/pricing";
import { cn } from "@/lib/utils";
import { useOrganizations } from "@/hooks/useOrganizations";
import { useOrganizationStore } from "@/store/organization";
import { organizationSelectors } from "@/store/organization/selectors";
import { useUserStore } from "@/store/user";
import { userSelectors } from "@/store/user/selectors";
import { usePaddle } from "@/hooks/usePaddle";

interface ProPlanGateProps {
  children: React.ReactNode;
}

export default function ProPlanGate({ children }: ProPlanGateProps) {
  const [billedYearly, setBilledYearly] = useState(false);
  const [loading, setLoading] = useState(false);

  const { isFirstFetchFinished } = useOrganizations();
  const isPro = useOrganizationStore(organizationSelectors.isPro);
  const activeOrgId = useOrganizationStore(organizationSelectors.activeOrgId);
  const completePaddleCheckout = useOrganizationStore((s) => s.completePaddleCheckout);
  const userEmail = useUserStore(userSelectors.email);

  const paddle = usePaddle(
    async (data) => {
      const customerId = (data as any)?.customer?.id;
      if (customerId && activeOrgId) {
        await completePaddleCheckout(activeOrgId, customerId);
      }
      toast.success("You're now on Pro! 500 credits have been added to your account.");
      setLoading(false);
    },
    () => setLoading(false),
  );

  const monthlyPriceId = process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID;
  const yearlyPriceId = process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID;
  const priceId = billedYearly ? yearlyPriceId : monthlyPriceId;

  function handleUpgrade() {
    if (!paddle || !priceId || !activeOrgId) {
      toast.error("Checkout unavailable — missing configuration");
      return;
    }
    setLoading(true);
    try {
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: userEmail ? { email: userEmail } : undefined,
        customData: { organizationId: activeOrgId },
        settings: { displayMode: "overlay", theme: "light", locale: "en" },
      });
    } catch {
      toast.error("Failed to open checkout");
      setLoading(false);
    }
  }

  if (!isFirstFetchFinished) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-start justify-center overflow-y-auto py-12 px-4">
        <div className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold">Upgrade to unlock Production Grade Projects</h2>
            <p className="text-muted-foreground text-sm">
              This content is available on the Pro plan. Choose a billing cycle to get started.
            </p>
          </div>

          {/* Yearly toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={cn("text-sm", !billedYearly && "font-semibold")}>Monthly</span>
            <Switch checked={billedYearly} onCheckedChange={setBilledYearly} />
            <span className={cn("text-sm", billedYearly && "font-semibold")}>
              Yearly
              <span className="ml-1.5 text-xs text-green-600 font-medium">Save ~14%</span>
            </span>
          </div>

          {/* Plan cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Free */}
            <div className="rounded-xl border border-border bg-background p-6 flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg">Free</span>
                  <Badge variant="outline" className="text-xs">Current plan</Badge>
                </div>
                <p className="text-3xl font-bold">
                  $0
                  <span className="text-base font-normal text-muted-foreground"> / month</span>
                </p>
              </div>
              <Button variant="outline" disabled className="w-full cursor-not-allowed text-muted-foreground">
                Current plan
              </Button>
              <PricingFeatureList features={freeFeatures} />
            </div>

            {/* Pro */}
            <div className="rounded-xl border-2 border-[#7000FF] bg-background p-6 flex flex-col gap-5 relative">
              <div className="absolute -top-3 left-6">
                <Badge className="bg-[#7000FF] text-white text-xs">Most popular</Badge>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg">Pro</span>
                </div>
                <p className="text-3xl font-bold">
                  {billedYearly ? pricing.yearly.amount : pricing.monthly.amount}
                  <span className="text-base font-normal text-muted-foreground"> {pricing.monthly.label}</span>
                </p>
                {billedYearly && (
                  <p className="text-sm text-green-600 font-medium mt-0.5">{pricing.yearly.note}</p>
                )}
              </div>
              <Button
                className="w-full font-semibold bg-[#7000FF] text-white hover:bg-[#7000FF]/90 hover:brightness-110 hover:scale-[1.02] transition-all"
                disabled={loading}
                onClick={handleUpgrade}
              >
                {loading ? "Opening checkout…" : "Upgrade to Pro"}
              </Button>
              <PricingFeatureList features={proFeatures} iconColor="text-[#7000FF]" />
            </div>
          </div>
        </div>
      </div>
  );
}
