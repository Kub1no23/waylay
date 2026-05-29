import { Database, Filter, BarChart3, Clock, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Database,
    title: "Rich Candidate Database",
    description:
      "Access thousands of pre-vetted candidate profiles with verified skills, work history, and availability. Every profile is structured for easy comparison.",
  },
  {
    icon: Filter,
    title: "Advanced Search Filters",
    description:
      "Filter by industry, experience level, skills, location, salary expectations, and more. Find exactly who you need with precision targeting.",
  },
  {
    icon: BarChart3,
    title: "Match Scoring Analytics",
    description:
      "Our algorithm analyzes dozens of data points to generate accurate match percentages. See at a glance which candidates best fit your requirements.",
  },
  {
    icon: Clock,
    title: "Faster Time-to-Hire",
    description:
      "Skip the job posting and application screening. Go directly to qualified candidates who match your needs—reducing hiring time by up to 60%.",
  },
  {
    icon: Shield,
    title: "Verified Information",
    description:
      "Candidate profiles include verified credentials, skill assessments, and reference checks. Hire with confidence knowing the data is accurate.",
  },
  {
    icon: Zap,
    title: "Instant Outreach",
    description:
      "Contact matched candidates directly through our platform. Send personalized messages and schedule interviews without leaving WayLay.",
  },
];

export default function Features() {
  return (
    <div className="min-h-screen w-full bg-white relative text-gray-800">
      {/* Circuit Board - Light Pattern */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),
        repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(75, 85, 99, 0.08) 19px, rgba(75, 85, 99, 0.08) 20px, transparent 20px, transparent 39px, rgba(75, 85, 99, 0.08) 39px, rgba(75, 85, 99, 0.08) 40px),
        radial-gradient(circle at 20px 20px, rgba(55, 65, 81, 0.12) 2px, transparent 2px),
        radial-gradient(circle at 40px 40px, rgba(55, 65, 81, 0.12) 2px, transparent 2px)
      `,
          backgroundSize: "40px 40px, 40px 40px, 40px 40px, 40px 40px",
        }}
      />
      <section id="features" className="py-20 sm:py-28 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section header */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-accent">
              For Businesses
            </p>
            <h2 className="mt-3 font-sans text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Everything You Need to Find Your Next Great Hire
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              WayLay provides powerful tools designed specifically for HR teams
              and hiring managers to discover, evaluate, and connect with
              qualified candidates.
            </p>
          </div>

          {/* Features grid */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="relative p-6 rounded-lg bg-card border border-border"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-foreground">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
