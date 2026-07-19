import { FadeIn } from "@/components/motion/fade-in";
import { Icon } from "@/components/ui/icon";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { loadContact } from "@/lib/content/load";

export function ContactSection() {
  const contact = loadContact();

  return (
    <ScrollSection id="contact" align="start" snap={false}>
      <FadeIn className="route-section-frame editorial-page contact-editorial editorial-compact">
        <SectionHeader label="CONTACT" title={contact.title} lede={contact.body} />
        <div className="contact-editorial__lead">
          <span className="hierarchy-label">EMAIL</span>
          <a href={`mailto:${contact.email}`} className="contact-editorial__email">
            {contact.email}
          </a>
        </div>
        <footer className="contact-editorial__footer">
          <div><span className="hierarchy-label">LOCATION</span><p>{contact.location}</p></div>
          <div>
            <span className="hierarchy-label">LINKS</span>
            <nav aria-label="소셜 링크">
              {contact.channels.filter((c) => c.href).map((c) => (
                <a key={c.name} href={c.href} target="_blank" rel="noopener noreferrer">
                  <Icon name={c.icon} size={15} />{c.name}
                </a>
              ))}
            </nav>
          </div>
        </footer>
      </FadeIn>
    </ScrollSection>
  );
}
