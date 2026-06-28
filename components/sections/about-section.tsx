import { FadeIn } from "@/components/motion/fade-in";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { loadAbout } from "@/lib/content/load";

export function AboutSection() {
  const about = loadAbout();

  return (
    <ScrollSection id="about">
      <FadeIn className="w-full max-w-5xl">
        <SectionHeader title={about.title} lede={about.intro} />

        <blockquote className="border-gold/30 text-foreground/90 mt-10 max-w-3xl border-l-2 pl-6 font-display text-xl leading-relaxed italic break-keep md:text-2xl">
          {about.quote}
        </blockquote>

        <div className="text-prose prose-columns mt-8 space-y-4 text-lg leading-relaxed text-foreground/90 break-keep [&_p]:break-inside-avoid">
          {about.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </FadeIn>
    </ScrollSection>
  );
}
