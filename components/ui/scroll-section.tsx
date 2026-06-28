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
  return (
    <section
      id={id}
      className={cn(
        "relative flex px-6 md:px-12 lg:px-16",
        align === "center"
          ? "items-center"
          : "items-start pt-28 pb-24 md:pt-32",
        snap ? "snap-section" : "snap-section-off",
        className,
      )}
      style={{ minHeight: height }}
    >
      {children}
    </section>
  );
}
