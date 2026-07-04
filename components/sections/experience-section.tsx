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
    <StaggerItem className="route-bento-item">
      <ElevatedCard className="experience-column">
        <h3 className="route-eyebrow">
          {title}
        </h3>
        <ul className="experience-list experience-line">
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
    <li className="experience-item">
      <span className="experience-dot" />
      <h4 className="experience-item__title">
        {title}
      </h4>
      {period && (
        <p className="experience-item__meta">
          {period}
        </p>
      )}
      {subtitle && (
        <p className="experience-item__body">
          {subtitle}
        </p>
      )}
      {extra && <p className="experience-item__extra">{extra}</p>}
    </li>
  );
}

export function ExperienceSection() {
  const exp = loadExperience();

  return (
    <ScrollSection id="experience" align="start">
      <FadeIn className="route-section-frame">
        <SectionHeader title={exp.title} />

        <Stagger className={cn(UNIFORM_BENTO_GRID_CLASS, "route-section-grid")}>
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
