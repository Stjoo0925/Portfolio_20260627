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
        "immersive-panel",
        align === "end" && "immersive-panel--end",
        align === "start" && "immersive-panel--start",
        align === "center" && "immersive-panel--center",
        className,
      )}
    >
      {children}
    </div>
  );
}
