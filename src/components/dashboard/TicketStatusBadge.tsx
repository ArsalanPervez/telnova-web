import { cn } from "@/lib/utils";
import { TicketStatus } from "@/types";

const config: Record<TicketStatus, { label: string; className: string }> = {
  OPEN: { label: "Open", className: "bg-yellow-100 text-yellow-700" },
  IN_PROGRESS: { label: "In Progress", className: "bg-blue-100 text-blue-700" },
  CLOSED: { label: "Closed", className: "bg-green-100 text-green-700" },
};

export default function TicketStatusBadge({ status }: { status: TicketStatus }) {
  const { label, className } = config[status] ?? config.OPEN;
  return (
    <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold uppercase", className)}>
      {label}
    </span>
  );
}
