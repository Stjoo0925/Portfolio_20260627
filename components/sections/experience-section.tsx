import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { ElevatedCard } from "@/components/ui/elevated-card";
import { loadExperience } from "@/lib/content/load";
import { UNIFORM_BENTO_GRID_CLASS } from "@/lib/ui/bento-grid";
import { cn } from "@/lib/utils";

function ExperienceColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <StaggerItem className="min-h-0">
      <ElevatedCard className="flex h-full min-w-0 flex-col p-8">
        <h3 className="text-gold/90 mb-8 font-mono text-[11px] uppercase tracking-[0.2em]">
          {title}
        </h3>
        <ul className="relative flex flex-1 flex-col gap-6 before:absolute before:top-2 before:bottom-2 before:left-[3px] before:w-px before:bg-white/10">
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
    <li className="relative pl-7">
      <span className="absolute top-2 -left-px h-[9px] w-[9px] rounded-full border-2 border-white/10 bg-accent/80 shadow-[0_0_8px_rgba(95,212,255,0.4)]" />
      <h4 className="font-display text-base leading-snug break-keep text-foreground/90">
        {title}
      </h4>
      {period && (
        <p className="text-muted mt-2 font-mono text-xs leading-relaxed tracking-wide break-keep">
          {period}
        </p>
      )}
      {subtitle && (
        <p className="text-foreground/80 mt-2 text-sm leading-relaxed break-keep">
          {subtitle}
        </p>
      )}
      {extra && <p className="text-accent mt-2 text-sm">{extra}</p>}
    </li>
  );
}

export function ExperienceSection() {
  const exp = loadExperience();

  return (
    <ScrollSection id="experience" align="start">
      <FadeIn className="w-full max-w-6xl">
        <SectionHeader title={exp.title} />

        <Stagger className={cn(UNIFORM_BENTO_GRID_CLASS, "mt-12")}>
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
