import { FadeIn } from "@/components/motion/fade-in";
import { ScrollSection } from "@/components/ui/scroll-section";
import { loadAbout } from "@/lib/content/load";

export function AboutSection() {
  const about = loadAbout();

  return (
    <ScrollSection id="about">
      <FadeIn className="max-w-2xl">
        <p className="text-gold mb-4 font-mono text-xs uppercase tracking-[0.3em]">
          {about.label}
        </p>
        <h2 className="font-display text-4xl font-bold md:text-6xl">
          {about.title}
        </h2>

        <p className="mt-6 text-xl text-foreground/95">{about.intro}</p>

        <div className="mt-6 space-y-4 text-lg text-foreground/90">
          {about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          {about.highlights.map((h) => (
            <span
              key={h}
              className="rounded-full border border-accent/20 bg-accent-soft px-3 py-1 text-sm text-accent"
            >
              {h}
            </span>
          ))}
        </div>
      </FadeIn>
    </ScrollSection>
  );
}
