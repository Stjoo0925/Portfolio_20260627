import { FadeIn } from "@/components/motion/fade-in";
import { ScrollSection } from "@/components/ui/scroll-section";
import { loadSkills } from "@/lib/content/load";

export function SkillsSection() {
  const skills = loadSkills();

  return (
    <ScrollSection id="skills" align="start" snap={false}>
      <FadeIn className="route-section-frame editorial-page skills-editorial">
        <header className="editorial-masthead">
          <h2>{skills.title}</h2>
        </header>
        <p className="editorial-deck">
          제품을 설계하고 구현하고 운영하기 위해 사용하는 기술입니다.
        </p>
        <ol className="skills-editorial__list">
          {skills.categories.map((cat) => (
            <li key={cat.name}>
              <h3>{cat.name}</h3>
              <p>{cat.items.join(" · ")}</p>
            </li>
          ))}
        </ol>
      </FadeIn>
    </ScrollSection>
  );
}
