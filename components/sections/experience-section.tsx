import { FadeIn } from "@/components/motion/fade-in";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { loadExperience } from "@/lib/content/load";

function ExperienceColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="career-editorial__section">
      <h3>{title}</h3>
      <ul>{children}</ul>
    </section>
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
    <li className="career-editorial__item">
      <h4>{title}</h4>
      {period && (
        <p className="career-editorial__period">
          {period}
        </p>
      )}
      {subtitle && (
        <p className="career-editorial__body">
          {subtitle}
        </p>
      )}
      {extra && <p className="career-editorial__extra">{extra}</p>}
    </li>
  );
}

export function ExperienceSection() {
  const exp = loadExperience();

  return (
    <ScrollSection id="experience" align="start" snap={false}>
      <FadeIn className="route-section-frame editorial-page career-editorial editorial-compact">
        <SectionHeader
          label="EXPERIENCE"
          title={exp.title}
          lede="경력, 교육, 훈련을 통해 쌓아온 실무 기반입니다."
        />
        <div className="career-editorial__grid">
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
        </div>
      </FadeIn>
    </ScrollSection>
  );
}
