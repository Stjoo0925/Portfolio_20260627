import { FadeIn } from "@/components/motion/fade-in";
import { ScrollSection } from "@/components/ui/scroll-section";
import { loadAbout } from "@/lib/content/load";

export function AboutSection() {
  const about = loadAbout();

  return (
    <ScrollSection id="about" align="start" snap={false}>
      <FadeIn className="route-section-frame about-editorial">
        <header className="about-editorial__masthead">
          <h2>{about.title}</h2>
        </header>

        <div className="about-editorial__lead">
          <p className="about-editorial__intro">{about.intro}</p>
          <blockquote className="about-editorial__quote">
            <p>{about.quote}</p>
          </blockquote>
        </div>

        <div className="about-editorial__story">
          <div className="about-editorial__columns">
            {about.paragraphs.map((paragraph, index) => (
              <p key={index} data-first={index === 0 ? "true" : undefined}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </FadeIn>
    </ScrollSection>
  );
}
