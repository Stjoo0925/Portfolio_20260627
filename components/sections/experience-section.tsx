import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ScrollSection } from "@/components/ui/scroll-section";
import { loadExperience } from "@/lib/content/load";

function ExperienceColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <StaggerItem className="flex flex-col rounded-2xl border border-border bg-background-elevated/50 p-6 backdrop-blur-sm">
      <h3 className="text-gold mb-5 font-mono text-xs uppercase tracking-[0.2em]">
        {title}
      </h3>
      <ul className="flex flex-1 flex-col gap-5">{children}</ul>
    </StaggerItem>
  );
}

function ExperienceItem({
  title,
  subtitle,
  period,
  extra,
}: {
  title: string;
  subtitle?: string;
  period?: string;
  extra?: string;
}) {
  return (
    <li className="relative border-l border-accent/25 pl-4">
      <span className="accent-glow absolute top-1.5 left-[-5px] h-2 w-2 rounded-full bg-accent" />
      <h4 className="font-display text-base leading-snug">{title}</h4>
      {period && <p className="text-muted mt-1 font-mono text-xs">{period}</p>}
      {subtitle && (
        <p className="text-foreground/80 mt-1 text-sm">{subtitle}</p>
      )}
      {extra && <p className="text-accent mt-1 text-sm">{extra}</p>}
    </li>
  );
}

export function ExperienceSection() {
  const exp = loadExperience();

  return (
    <ScrollSection id="experience">
      <FadeIn className="w-full max-w-6xl">
        <p className="text-gold mb-4 font-mono text-xs uppercase tracking-[0.3em]">
          {exp.label}
        </p>
        <h2 className="font-display text-4xl font-bold md:text-6xl">
          {exp.title}
        </h2>

        <Stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <ExperienceColumn title="Career">
            {exp.career.map((item) => (
              <ExperienceItem
                key={item.org}
                title={item.org}
                subtitle={item.description}
                period={item.period}
              />
            ))}
          </ExperienceColumn>

          <ExperienceColumn title="Education">
            {exp.education.map((item) => (
              <ExperienceItem
                key={item.school}
                title={item.school}
                subtitle={item.major}
                period={item.period}
                extra={item.gpa ? `학점: ${item.gpa}` : undefined}
              />
            ))}
          </ExperienceColumn>

          <ExperienceColumn title="Training">
            {exp.training.map((item) => (
              <ExperienceItem
                key={item.title}
                title={item.title}
                subtitle={item.org}
                period={item.period}
              />
            ))}
          </ExperienceColumn>

          <ExperienceColumn title="Certificate">
            {exp.certificates.map((item) => (
              <ExperienceItem
                key={item.name}
                title={item.name}
                subtitle={item.org}
              />
            ))}
          </ExperienceColumn>
        </Stagger>
      </FadeIn>
    </ScrollSection>
  );
}
