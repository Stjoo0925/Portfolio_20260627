import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { ElevatedCard } from "@/components/ui/elevated-card";
import { Icon } from "@/components/ui/icon";
import { loadContact } from "@/lib/content/load";

function ContactRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="contact-row">
      <h3 className="contact-row__label">
        {label}
      </h3>
      <div className="contact-row__body">{children}</div>
    </div>
  );
}

export function ContactSection() {
  const contact = loadContact();

  return (
    <ScrollSection id="contact" align="start">
      <FadeIn className="route-section-frame">
        <SectionHeader title={contact.title} lede={contact.body} />

        <ElevatedCard className="route-panel-card">
          <Stagger>
            <StaggerItem>
              <ContactRow label="Email">
                <a
                  href={`mailto:${contact.email}`}
                  className="contact-link contact-link--primary"
                >
                  {contact.email}
                </a>
              </ContactRow>
            </StaggerItem>

            <StaggerItem>
              <div className="section-token-divider">
                <ContactRow label="Location">
                  <p className="contact-location">
                    {contact.location}
                  </p>
                </ContactRow>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="section-token-divider">
                <ContactRow label="Social">
                  <div className="contact-socials">
                    {contact.channels
                      .filter((c) => c.href)
                      .map((c) => (
                        <a
                          key={c.name}
                          href={c.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contact-link"
                          aria-label={c.name}
                        >
                          <Icon name={c.icon} size={16} />
                          {c.name}
                        </a>
                      ))}
                  </div>
                </ContactRow>
              </div>
            </StaggerItem>
          </Stagger>
        </ElevatedCard>
      </FadeIn>
    </ScrollSection>
  );
}
