import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { ElevatedCard } from "@/components/ui/elevated-card";
import { loadSkills } from "@/lib/content/load";
import { UNIFORM_BENTO_GRID_CLASS } from "@/lib/ui/bento-grid";
import { cn } from "@/lib/utils";

export function SkillsSection() {
  const skills = loadSkills();

  return (
    <ScrollSection id="skills" align="start">
      <FadeIn className="w-full max-w-6xl">
        <SectionHeader title={skills.title} />

        <Stagger className={cn(UNIFORM_BENTO_GRID_CLASS, "mt-12")}>
          {skills.categories.map((cat) => (
            <StaggerItem key={cat.name} className="min-h-0">
              <ElevatedCard className="flex h-full flex-col p-8 md:p-9">
                <h3 className="text-gold/90 mb-6 font-mono text-[11px] uppercase tracking-[0.2em]">
                  {cat.name}
                </h3>
                <p className="font-display text-lg leading-relaxed text-foreground/90 break-keep md:text-xl">
                  {cat.items.map((item, itemIndex) => (
                    <span key={item}>
                      {itemIndex > 0 && (
                        <span
                          className="text-muted/40 mx-3 font-sans text-sm"
                          aria-hidden
                        >
                          ·
                        </span>
                      )}
                      {item}
                    </span>
                  ))}
                </p>
              </ElevatedCard>
            </StaggerItem>
          ))}
        </Stagger>
      </FadeIn>
    </ScrollSection>
  );
}
