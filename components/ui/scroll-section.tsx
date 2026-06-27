import { cn } from "@/lib/utils";

export function ScrollSection({
  children,
  className,
  height = "100vh",
  id,
  snap = true,
}: {
  children: React.ReactNode;
  className?: string;
  height?: string;
  id?: string;
  snap?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative flex items-center px-6 md:px-12 lg:px-16",
        snap ? "snap-section" : "snap-section-off",
        className,
      )}
      style={{ minHeight: height }}
    >
      {children}
    </section>
  );
}
