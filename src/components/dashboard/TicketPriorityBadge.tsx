import { cn } from "@/lib/utils";
import { TicketPriority } from "@/types";

const labels: Record<TicketPriority, string> = {
  1: "Critical",
  2: "High",
  3: "Medium",
  4: "Low",
  5: "Lowest",
};

const colors: Record<TicketPriority, string> = {
  1: "text-red-700",
  2: "text-red-500",
  3: "text-orange-500",
  4: "text-green-600",
  5: "text-gray-500",
};

export default function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
  const label = labels[priority] ?? `P${priority}`;
  const color = colors[priority] ?? "text-gray-500";
  return (
    <span className={cn("text-xs font-semibold", color)}>
      ▲ {label}
    </span>
  );
}
