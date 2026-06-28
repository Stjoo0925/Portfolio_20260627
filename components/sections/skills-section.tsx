import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { TagChip } from "@/components/ui/tag-chip";
import { ElevatedCard } from "@/components/ui/elevated-card";
import { loadSkills } from "@/lib/content/load";

export function SkillsSection() {
  const skills = loadSkills();

  return (
    <ScrollSection id="skills">
      <FadeIn className="w-full max-w-4xl">
        <SectionHeader title={skills.title} />

        <Stagger className="mt-10 grid gap-6 sm:grid-cols-2">
          {skills.categories.map((cat) => (
            <StaggerItem key={cat.name}>
              <ElevatedCard className="h-full p-6">
                <h3 className="font-display text-xl">{cat.name}</h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {cat.items.map((item) => (
                    <li key={item}>
                      <TagChip variant="muted">{item}</TagChip>
                    </li>
                  ))}
                </ul>
              </ElevatedCard>
            </StaggerItem>
          ))}
        </Stagger>
      </FadeIn>
    </ScrollSection>
  );
}
