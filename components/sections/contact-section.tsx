import { FadeIn } from "@/components/motion/fade-in";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ScrollSection } from "@/components/ui/scroll-section";
import { SectionHeader } from "@/components/ui/section-header";
import { ElevatedCard } from "@/components/ui/elevated-card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { loadContact } from "@/lib/content/load";

function ContactRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 px-8 py-8 md:flex-row md:items-start md:gap-10 md:px-10 md:py-9">
      <h3 className="text-gold shrink-0 font-mono text-[11px] uppercase tracking-[0.24em] md:w-28 md:pt-1">
        {label}
      </h3>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export function ContactSection() {
  const contact = loadContact();

  return (
    <ScrollSection id="contact" align="start">
      <FadeIn className="w-full max-w-6xl">
        <SectionHeader title={contact.title} lede={contact.body} />

        <ElevatedCard className="mt-12 p-0">
          <Stagger>
            <StaggerItem>
              <ContactRow label="Email">
                <a
                  href={`mailto:${contact.email}`}
                  className="text-accent star-glow font-mono text-sm transition-opacity hover:opacity-80"
                >
                  {contact.email}
                </a>
              </ContactRow>
            </StaggerItem>

            <StaggerItem>
              <div className="border-t border-white/[0.08]">
                <ContactRow label="Location">
                  <p className="text-foreground/90 font-mono text-sm break-keep">
                    {contact.location}
                  </p>
                </ContactRow>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="border-t border-white/[0.08]">
                <ContactRow label="Social">
                  <div className="flex flex-wrap gap-5">
                    {contact.channels
                      .filter((c) => c.href)
                      .map((c) => (
                        <a
                          key={c.name}
                          href={c.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "text-muted flex items-center gap-2 font-mono text-xs uppercase tracking-widest transition-colors hover:text-accent",
                          )}
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
