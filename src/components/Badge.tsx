import { ReactNode } from "react";

type BadgeTone = "success" | "warning" | "neutral" | "danger";

const tones: Record<BadgeTone, string> = {
  success: "badge-success",
  warning: "badge-warning",
  neutral: "badge-neutral",
  danger: "badge-danger",
};

export function Badge({ tone = "neutral", children }: { tone?: BadgeTone; children: ReactNode }) {
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}
