import { ExternalLink, ShieldCheck } from "lucide-react";

const officialLinks = [
  {
    title: "Mobilization timetable",
    description: "Check the latest official batch and stream dates published by NYSC.",
    href: "https://www.nysc.gov.ng/mobtable.html",
  },
  {
    title: "Service year guide",
    description: "Review the four official service-year segments and their requirements.",
    href: "https://www.nysc.gov.ng/serviceyear.html",
  },
  {
    title: "Orientation camp addresses",
    description: "Verify the official orientation camp location for your state.",
    href: "https://www.nysc.gov.ng/camps.html",
  },
  {
    title: "NYSC support lines",
    description: "Use official NYSC contacts for mobilization and other enquiries.",
    href: "https://www.nysc.gov.ng/supportline.html",
  },
];

export function OfficialUpdates() {
  return (
    <section className="mb-8">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={17} className="text-success" />
            <h3 className="text-sm font-semibold text-foreground">Official NYSC sources</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Verify dates, requirements and contacts from NYSC before acting on an update.
          </p>
        </div>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-success bg-success/10 px-2 py-1 rounded-full">
          Verified source
        </span>
      </div>

      <div className="bg-card border border-border rounded-2xl divide-y divide-border overflow-hidden">
        {officialLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 p-4 hover:bg-muted/40 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{link.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
            </div>
            <ExternalLink size={16} className="shrink-0 text-muted-foreground" aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  );
}
