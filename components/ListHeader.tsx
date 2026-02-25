import { ChevronDown } from "lucide-react";

interface Column {
  key: string;
  label: string;
  span: number;
  align?: "left" | "center" | "right";
  sortable?: boolean;
}

interface ListHeaderProps {
  columns: Column[];
  onSort?: (key: string) => void;
  sortKey?: string;
  sortDir?: "asc" | "desc";
}

const defaultColumns: Column[] = [
  { key: "business", label: "Business & Title", span: 4, sortable: true },
  { key: "service", label: "Service", span: 1, sortable: true },
  { key: "schedule", label: "Schedule", span: 2, align: "center", sortable: true },
  { key: "experience", label: "Exp", span: 1, sortable: true },
  { key: "compensation", label: "Compensation", span: 2, sortable: true },
  { key: "location", label: "Location", span: 2, sortable: true },
];

export default function ListHeader({
  columns = defaultColumns,
  onSort,
  sortKey,
}: ListHeaderProps) {
  return (
    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-bg-surface/50 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
      {columns.map((col) => (
        <div
          key={col.key}
          className={`col-span-${col.span} flex items-center gap-1 ${
            col.align === "center"
              ? "justify-center"
              : col.align === "right"
              ? "justify-end"
              : ""
          } ${col.sortable ? "cursor-pointer hover:text-white transition-colors" : ""}`}
          onClick={() => col.sortable && onSort?.(col.key)}
        >
          {col.label}
          {col.sortable && (
            <ChevronDown
              className={`w-3 h-3 ${sortKey === col.key ? "text-primary" : ""}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
