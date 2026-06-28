import { cn } from "@/lib/utils";

export function ScrollSection({
  children,
  className,
  height = "100vh",
  id,
  snap = true,
  align = "center",
}: {
  children: React.ReactNode;
  className?: string;
  height?: string;
  id?: string;
  snap?: boolean;
  align?: "center" | "start";
}) {
  const isStart = align === "start";

  return (
    <section
      id={id}
      className={cn(
        "relative flex w-full px-6 md:px-12 lg:px-16",
        isStart
          ? "items-start scroll-mt-28 pt-28 pb-28 md:scroll-mt-32 md:pt-32 md:pb-32"
          : "items-center py-16 md:py-20",
        snap ? "snap-section" : "snap-section-off",
        className,
      )}
      style={{ minHeight: height }}
    >
      {children}
    </section>
  );
}
