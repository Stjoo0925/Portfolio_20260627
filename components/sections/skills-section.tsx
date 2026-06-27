import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ScrollSection } from "@/components/ui/scroll-section";
import { loadSkills } from "@/lib/content/load";

export function SkillsSection() {
  const skills = loadSkills();

  return (
    <ScrollSection id="skills">
      <FadeIn className="max-w-3xl">
        <p className="text-gold mb-4 font-mono text-xs uppercase tracking-[0.3em]">
          {skills.label}
        </p>
        <h2 className="font-display text-4xl font-bold md:text-6xl">
          {skills.title}
        </h2>

        <Stagger className="mt-10 grid gap-6 sm:grid-cols-2">
          {skills.categories.map((cat) => (
            <StaggerItem
              key={cat.name}
              className="rounded-2xl border border-border bg-background-elevated/60 p-6 backdrop-blur-sm"
            >
              <h3 className="font-display text-xl">{cat.name}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {cat.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-accent/15 bg-accent-soft/60 px-3 py-1 text-sm text-foreground/90"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </FadeIn>
    </ScrollSection>
  );
}
