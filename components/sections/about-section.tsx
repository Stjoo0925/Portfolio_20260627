import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { ElevatedCard } from "@/components/ui/elevated-card";
import { loadAbout } from "@/lib/content/load";

export function AboutSection() {
  const about = loadAbout();

  return (
    <ScrollSection id="about" align="start">
      <FadeIn className="route-section-frame">
        <SectionHeader title={about.title} />

        <ElevatedCard className="route-panel-card">
          <Stagger>
            <StaggerItem>
              <div className="about-lead">
                <blockquote className="section-quote">
                  <p className="section-quote-text">
                    {about.quote}
                  </p>
                </blockquote>
                <p className="section-intro-copy">
                  {about.intro}
                </p>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="about-body section-token-divider">
                {about.paragraphs.map((paragraph, index) => (
                  <p
                    key={index}
                    className="section-body-copy"
                    data-secondary={index > 0 ? "true" : undefined}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </StaggerItem>
          </Stagger>
        </ElevatedCard>
      </FadeIn>
    </ScrollSection>
  );
}
