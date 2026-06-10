import * as React from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { useTranslation } from "@/lib/locale";

type BillingCycle = 'monthly' | 'yearly';

export interface PricingFeature {
  name: string;
  isIncluded: boolean;
}

export interface PricingTierCard {
  id: string;
  name: string;
  description: string;
  priceMonthly: string;
  priceYearly: string;
  periodMonthly: string;
  periodYearly: string;
  isPopular: boolean;
  buttonLabel: string;
  features: PricingFeature[];
}

interface PricingCardsProps extends React.HTMLAttributes<HTMLDivElement> {
  plans: PricingTierCard[];
  billingCycle: BillingCycle;
  onCycleChange: (cycle: BillingCycle) => void;
  onPlanSelect: (planId: string, cycle: BillingCycle) => void;
  loadingPlan?: string | null;
}

const FeatureItem: React.FC<{ feature: PricingFeature }> = ({ feature }) => {
  const Icon = feature.isIncluded ? Check : X;
  return (
    <li className="flex items-start gap-3 py-1.5">
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 mt-0.5",
          feature.isIncluded ? "text-primary" : "text-muted-foreground/50"
        )}
        aria-hidden="true"
      />
      <span className={cn("text-sm leading-snug", feature.isIncluded ? "text-foreground" : "text-muted-foreground/60 line-through")}>
        {feature.name}
      </span>
    </li>
  );
};

export const PricingCards: React.FC<PricingCardsProps> = ({
  plans,
  billingCycle,
  onCycleChange,
  onPlanSelect,
  loadingPlan,
  className,
  ...props
}) => {
  const { t } = useTranslation();
  const allFeatures = Array.from(new Set(plans.flatMap(p => p.features.map(f => f.name))));

  return (
    <div className={cn("w-full", className)} {...props}>
      {/* Billing toggle — extra top padding so the savings badge doesn't clip */}
      <div className="flex justify-center pt-6 pb-10">
        <ToggleGroup
          type="single"
          value={billingCycle}
          onValueChange={(value) => {
            if (value === 'monthly' || value === 'yearly') onCycleChange(value);
          }}
          aria-label="Select billing cycle"
          className="border rounded-lg p-1 bg-muted/50"
        >
          <ToggleGroupItem
            value="monthly"
            aria-label="Monthly billing"
            className="px-6 py-1.5 text-sm font-medium data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:border data-[state=on]:ring-1 data-[state=on]:ring-ring/20 rounded-md transition-colors"
          >
            {t('billing_cycle_monthly')}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="yearly"
            aria-label="Annual billing"
            className="px-6 py-1.5 text-sm font-medium data-[state=on]:bg-background data-[state=on]:shadow-sm data-[state=on]:border data-[state=on]:ring-1 data-[state=on]:ring-ring/20 rounded-md transition-colors relative"
          >
            {t('billing_cycle_yearly')}
            <span className="absolute -top-3.5 right-0 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full whitespace-nowrap leading-none">
              {t('billing_savings')}
            </span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Cards grid — align-stretch so all cards same height */}
      <div className={cn(
        "grid gap-5 items-stretch",
        plans.length <= 3 ? "md:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4"
      )}>
        {plans.map((plan) => {
          const currentPrice = billingCycle === 'monthly' ? plan.priceMonthly : plan.priceYearly;
          const currentPeriod = billingCycle === 'monthly' ? plan.periodMonthly : plan.periodYearly;
          const isLoading = loadingPlan === plan.id;

          return (
            <Card
              key={plan.id}
              className={cn(
                "flex flex-col transition-shadow duration-300 hover:shadow-lg",
                plan.isPopular
                  ? "ring-2 ring-primary shadow-lg shadow-primary/15 border-primary/30"
                  : "shadow-sm"
              )}
            >
              <CardHeader className="p-5 pb-4 space-y-0">
                {/* Popular badge — inline, no absolute positioning */}
                {plan.isPopular ? (
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-lg font-bold">{plan.name}</CardTitle>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-primary text-primary-foreground rounded-full shrink-0 whitespace-nowrap">
                      {t('most_popular')}
                    </span>
                  </div>
                ) : (
                  <CardTitle className="text-lg font-bold mb-2">{plan.name}</CardTitle>
                )}
                <CardDescription className="text-sm">{plan.description}</CardDescription>
                <div className="pt-4">
                  <p className="text-3xl font-extrabold text-foreground leading-none">
                    {currentPrice}
                    {currentPeriod && (
                      <span className="text-sm font-normal text-muted-foreground ml-1">{currentPeriod}</span>
                    )}
                  </p>
                </div>
              </CardHeader>

              <CardContent className="flex-1 px-5 py-0">
                <ul className="space-y-0">
                  {plan.features.map((feature) => (
                    <FeatureItem key={feature.name} feature={feature} />
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-5 pt-4">
                <Button
                  onClick={() => onPlanSelect(plan.id, billingCycle)}
                  disabled={isLoading}
                  variant={plan.isPopular ? 'default' : 'outline'}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Ładowanie...' : plan.buttonLabel}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Comparison table — desktop only */}
      {allFeatures.length > 0 && (
        <div className="mt-16 hidden md:block border rounded-lg overflow-x-auto shadow-sm">
          <table className="min-w-full divide-y divide-border/80">
            <thead>
              <tr className="bg-muted/30">
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold text-foreground/80 min-w-[180px]">
                  Feature
                </th>
                {plans.map((plan) => (
                  <th
                    key={`th-${plan.id}`}
                    scope="col"
                    className={cn(
                      "px-6 py-4 text-center text-sm font-semibold text-foreground/80 whitespace-nowrap",
                      plan.isPopular && "bg-primary/10"
                    )}
                  >
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/80 bg-background/90">
              {allFeatures.map((featureName, index) => (
                <tr
                  key={featureName}
                  className={cn(
                    "transition-colors hover:bg-accent/20",
                    index % 2 === 0 ? "bg-background" : "bg-muted/10"
                  )}
                >
                  <td className="px-6 py-3 text-left text-sm font-medium text-foreground/90">
                    {featureName}
                  </td>
                  {plans.map((plan) => {
                    const feature = plan.features.find(f => f.name === featureName);
                    const isIncluded = feature?.isIncluded ?? false;
                    const Icon = isIncluded ? Check : X;
                    return (
                      <td
                        key={`${plan.id}-${featureName}`}
                        className={cn("px-6 py-3 text-center", plan.isPopular && "bg-primary/5")}
                      >
                        <Icon
                          className={cn("h-5 w-5 mx-auto", isIncluded ? "text-primary" : "text-muted-foreground/50")}
                          aria-hidden="true"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
