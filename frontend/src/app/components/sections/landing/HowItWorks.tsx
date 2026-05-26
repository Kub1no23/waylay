import { UserPlus, Search, Handshake } from "lucide-react";

const steps = [
  {
    number: "1",
    icon: UserPlus,
    title: "Candidates Create Profiles",
    description:
      "Job seekers build comprehensive profiles showcasing their skills, experience, work preferences, and career goals. No more endless applications—they set up once and wait for opportunities.",
  },
  {
    number: "2",
    icon: Search,
    title: "Businesses Search Talent",
    description:
      "Your HR team creates job offers and searches our talent database. Our intelligent matching algorithm surfaces candidates who best fit your requirements, ranked by match percentage.",
  },
  {
    number: "3",
    icon: Handshake,
    title: "Connect & Hire",
    description:
      "Review matched candidates, reach out directly to your top picks, and move forward with interviews. The right talent is always just a search away.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-card">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            How It Works
          </p>
          <h2 className="mt-3 font-sans text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            A Simpler Way to Find Great Talent
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            WayLay reverses the traditional job search. Instead of posting jobs
            and waiting, you actively discover pre-qualified candidates ready to
            work.
          </p>
        </div>

        {/* Steps */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-1/2 w-full h-px bg-border" />
                )}

                <div className="relative flex flex-col items-center text-center">
                  {/* Icon container */}
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
                      <step.icon className="h-7 w-7" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="mt-6 text-lg font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
