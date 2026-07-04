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
      <FadeIn className="route-section-frame">
        <SectionHeader title={skills.title} />

        <Stagger className={cn(UNIFORM_BENTO_GRID_CLASS, "route-section-grid")}>
          {skills.categories.map((cat) => (
            <StaggerItem key={cat.name} className="route-bento-item">
              <ElevatedCard className="skill-card">
                <h3 className="route-eyebrow">
                  {cat.name}
                </h3>
                <p className="skill-card__items">
                  {cat.items.map((item, itemIndex) => (
                    <span key={item}>
                      {itemIndex > 0 && (
                        <span
                          className="skill-card__separator"
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
