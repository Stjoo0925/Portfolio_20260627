import { CanvasWrapper } from "@/components/canvas/canvas-wrapper";
import { SectionRouter } from "@/components/sections/section-router";
import { Nav } from "@/components/ui/nav";
import { loadSections } from "@/lib/content/load";

export default function Home() {
  const sections = loadSections();

  return (
    <>
      <CanvasWrapper sections={sections} />
      <Nav />

      <div className="relative" style={{ zIndex: "var(--z-content)" }}>
        {sections.map((section) => (
          <SectionRouter key={section.id} section={section} />
        ))}
      </div>
    </>
  );
}
