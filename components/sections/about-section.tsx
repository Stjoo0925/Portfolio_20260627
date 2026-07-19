import { FadeIn } from "@/components/motion/fade-in";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { loadAbout } from "@/lib/content/load";

export function AboutSection() {
  const about = loadAbout();
  const groups = [
    {
      label: "BACKGROUND",
      title: "현장에서 익힌 문제 정의",
      paragraphs: about.paragraphs.slice(0, 1),
    },
    {
      label: "SHIFT",
      title: "개발로 확장한 실행 방식",
      paragraphs: about.paragraphs.slice(1, 2),
    },
    {
      label: "PRACTICE",
      title: "AI를 활용하는 현재의 방식",
      paragraphs: about.paragraphs.slice(2),
    },
  ];

  return (
    <ScrollSection id="about" align="start" snap={false}>
      <FadeIn className="route-section-frame about-editorial editorial-compact">
        <SectionHeader label="PROFILE" title={about.title} lede={about.intro} />

        <div className="about-editorial__lead">
          <span className="hierarchy-label">PRINCIPLE</span>
          <blockquote className="about-editorial__quote">
            <p>{about.quote}</p>
          </blockquote>
        </div>

        <div className="about-editorial__story">
          {groups.map((group, groupIndex) => (
            <section
              className="about-editorial__group"
              key={group.label}
              data-reveal=""
              style={{ "--reveal-delay": `${groupIndex * 90}ms` } as React.CSSProperties}
            >
              <header>
                <span className="hierarchy-label">{group.label}</span>
                <h2>{group.title}</h2>
              </header>
              <div>
                {group.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </FadeIn>
    </ScrollSection>
  );
}
