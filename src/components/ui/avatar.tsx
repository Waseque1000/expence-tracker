import Image from "next/image";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";

const COLORS = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-cyan-500",
];

export function Avatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string;
  className?: string;
}) {
  if (src) {
    return (
      <span
        className={cn(
          "relative block h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-[var(--primary)]/30",
          className
        )}
      >
        <Image
          src={src}
          alt={name}
          fill
          sizes="40px"
          referrerPolicy="no-referrer"
          className="object-cover"
        />
      </span>
    );
  }

  const idx = name.charCodeAt(0) % COLORS.length;
  return (
    <div
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-[var(--primary)]/30",
        COLORS[idx],
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
