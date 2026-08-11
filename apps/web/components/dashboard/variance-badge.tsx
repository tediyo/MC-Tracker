import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface VarianceBadgeProps {
  label: string;
  /** e.g. costVariance or savingsVariance, in USD. `null` when no plan covers the period. */
  value: number | null;
  /** true for "positive = good" (savings variance); false for "negative = good" is never the case here, so this only toggles the icon direction's meaning if ever needed. */
  goodWhenPositive?: boolean;
}

/**
 * Status color is never the only signal here - always paired with an icon
 * and a text label (dataviz skill's status-color rule), using the fixed
 * status palette tokens (--status-good / --status-critical) rather than a
 * categorical series color.
 */
export function VarianceBadge({ label, value, goodWhenPositive = true }: VarianceBadgeProps) {
  if (value === null) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Minus className="h-4 w-4" />
        <span>{label}: no plan set</span>
      </div>
    );
  }

  const isGood = goodWhenPositive ? value >= 0 : value <= 0;
  const Icon = value === 0 ? Minus : isGood ? TrendingUp : TrendingDown;
  const color = isGood ? "var(--status-good)" : "var(--status-critical)";

  return (
    <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color }}>
      <Icon className="h-4 w-4" />
      <span>
        {label}: {value >= 0 ? "+" : ""}
        {formatCurrency(value)}
      </span>
    </div>
  );
}
