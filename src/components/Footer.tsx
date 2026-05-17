import { Instagram, Twitter, Linkedin, Facebook } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-border pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2">
            <div className="font-display text-3xl">
              <span className="text-gradient-gold">Serene </span>Mansion
            </div>
            <p className="mt-4 text-foreground/60 max-w-sm leading-relaxed">
              A private brokerage representing the world's most distinguished homes. By introduction only.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="mt-8 flex max-w-md glass rounded-full p-1.5">
              <input
                placeholder="Subscribe to our private letter"
                className="flex-1 bg-transparent px-5 py-2 text-sm outline-none placeholder:text-foreground/40"
              />
              <button className="px-6 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover-glow">
                Join
              </button>
            </form>
          </div>

          <FooterCol title="Explore" links={["Properties", "Projects", "Gallery", "About"]} />
          <FooterCol title="Office" links={["Uttarakhand ",]} />
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="text-sm text-foreground/40">
            © {new Date().getFullYear()} Serene Mansion. All rights reserved.
          </div>
          <div className="flex gap-3">
            {[Instagram, Twitter, Linkedin, Facebook].map((Icon, i) => (
              <a
                key={i}
                href="https://www.instagram.com/serenemansion_homestay/"
                className="w-10 h-10 rounded-full glass flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/40 transition-all"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.3em] text-primary mb-5">{title}</div>
      <ul className="space-y-3">
        {links.map((l) => (
          <li key={l}>
            <a href="#" className="text-foreground/70 hover:text-primary transition-colors">{l}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
