import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { ElevatedCard } from "@/components/ui/elevated-card";
import { loadExperience } from "@/lib/content/load";

function ExperienceColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <StaggerItem className="min-w-0">
      <ElevatedCard className="flex h-full min-w-0 flex-col p-6">
        <h3 className="text-gold mb-5 font-mono text-xs uppercase tracking-[0.2em]">
          {title}
        </h3>
        <ul className="relative flex flex-1 flex-col gap-5 before:absolute before:top-2 before:bottom-2 before:left-[3px] before:w-px before:bg-accent/15">
          {children}
        </ul>
      </ElevatedCard>
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
    <li className="relative pl-5">
      <span className="accent-glow absolute top-1.5 left-0 h-2 w-2 rounded-full bg-accent" />
      <h4 className="font-display text-base leading-snug break-keep">{title}</h4>
      {period && (
        <p className="text-muted mt-1 font-mono text-xs leading-relaxed tracking-wide break-keep">
          {period}
        </p>
      )}
      {subtitle && (
        <p className="text-foreground/80 mt-1 text-sm leading-relaxed break-keep">
          {subtitle}
        </p>
      )}
      {extra && <p className="text-accent mt-1 text-sm">{extra}</p>}
    </li>
  );
}

export function ExperienceSection() {
  const exp = loadExperience();

  return (
    <ScrollSection id="experience">
      <FadeIn className="w-full max-w-[90rem]">
        <SectionHeader title={exp.title} />

        <Stagger className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
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
