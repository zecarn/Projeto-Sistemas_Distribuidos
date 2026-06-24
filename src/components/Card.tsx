import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-2xl border border-black/10 bg-white p-5 shadow-sm ${className}`} {...props} />;
}
