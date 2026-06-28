import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { ElevatedCard } from "@/components/ui/elevated-card";
import { cn } from "@/lib/utils";
import { loadAbout } from "@/lib/content/load";

export function AboutSection() {
  const about = loadAbout();

  return (
    <ScrollSection id="about" align="start">
      <FadeIn className="w-full max-w-6xl">
        <SectionHeader title={about.title} />

        <ElevatedCard className="mt-12 p-0">
          <Stagger>
            <StaggerItem>
              <div className="border-t border-white/8 px-8 py-9 md:px-10 md:py-10">
                <blockquote className="relative pl-6 before:absolute before:top-1 before:bottom-1 before:left-0 before:w-px before:bg-gold/45">
                  <p className="font-display text-xl leading-relaxed text-foreground/90 italic break-keep md:text-2xl">
                    {about.quote}
                  </p>
                </blockquote>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="px-8 py-9 md:px-10 md:py-10">
                <p className="max-w-4xl text-readable text-pretty text-prose text-lg text-foreground/90 md:text-xl">
                  {about.intro}
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="space-y-6 border-t border-white/8 px-8 py-9 md:px-10 md:py-10">
                {about.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className={cn(
                      "text-measure-wide text-base leading-relaxed text-foreground/85 break-keep md:text-lg",
                      index > 0 && "text-foreground/80",
                    )}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </StaggerItem>
          </Stagger>
        </ElevatedCard>
      </FadeIn>
    </ScrollSection>
  );
}
