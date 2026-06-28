import { FadeIn } from "@/components/motion/fade-in";
import { Icon } from "@/components/ui/icon";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { loadContact } from "@/lib/content/load";

export function ContactSection() {
  const contact = loadContact();

  return (
    <ScrollSection id="contact">
      <FadeIn className="max-w-2xl">
        <SectionHeader title={contact.title} lede={contact.body} />

        <div className="terminal-panel scanlines mt-10 p-6 md:p-8">
          <dl className="space-y-6">
            <div>
              <dt className="text-muted font-mono text-xs uppercase tracking-widest">
                Email
              </dt>
              <dd className="mt-2">
                <a
                  href={`mailto:${contact.email}`}
                  className="text-accent star-glow font-mono text-sm transition-opacity hover:opacity-80"
                >
                  {contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-muted font-mono text-xs uppercase tracking-widest">
                Location
              </dt>
              <dd className="text-foreground/90 mt-2 font-mono text-sm">
                {contact.location}
              </dd>
            </div>
            <div>
              <dt className="text-muted font-mono text-xs uppercase tracking-widest">
                Social
              </dt>
              <dd className="mt-3">
                <div className="flex flex-wrap gap-6">
                  {contact.channels
                    .filter((c) => c.href)
                    .map((c) => (
                      <a
                        key={c.name}
                        href={c.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted flex items-center gap-2 font-mono text-xs uppercase tracking-widest transition-colors hover:text-accent"
                        aria-label={c.name}
                      >
                        <Icon name={c.icon} size={18} />
                        {c.name}
                      </a>
                    ))}
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </FadeIn>
    </ScrollSection>
  );
}
