import { FadeIn } from "@/components/motion/fade-in";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { loadSkills } from "@/lib/content/load";

export function SkillsSection() {
  const skills = loadSkills();

  return (
    <ScrollSection id="skills" align="start" snap={false}>
      <FadeIn className="route-section-frame editorial-page skills-editorial editorial-compact">
        <SectionHeader
          label="CAPABILITIES"
          title={skills.title}
          lede="제품을 설계하고 구현하고 운영하기 위해 사용하는 기술입니다."
        />
        <ol className="skills-editorial__list">
          {skills.categories.map((cat, index) => (
            <li key={cat.name}>
              <div className="skills-editorial__identity">
                <span className="skills-editorial__number">
                  {String(index + 1).padStart(2, "0")} / CATEGORY
                </span>
                <h2>{cat.name}</h2>
              </div>
              <div className="skills-editorial__chips" aria-label={`${cat.name} stack`}>
                {cat.items.map((item, itemIndex) => (
                  <span
                    className="skills-editorial__chip"
                    data-primary={itemIndex === 0 ? "true" : undefined}
                    key={item}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </FadeIn>
    </ScrollSection>
  );
}
