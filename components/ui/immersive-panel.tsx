import { cn } from "@/lib/utils";

export function ImmersivePanel({
  children,
  className,
  align = "end",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end" | "center";
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-md rounded-2xl border border-white/8 bg-background/25 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl md:max-w-lg md:p-7",
        "ring-1 ring-white/4",
        align === "end" && "ml-auto",
        align === "start" && "mr-auto",
        align === "center" && "mx-auto",
        className,
      )}
    >
      {children}
    </div>
  );
}
