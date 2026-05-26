import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "WayLay completely transformed how we hire. Instead of sorting through hundreds of irrelevant applications, we now go straight to candidates who match our needs. We filled three senior roles in under two weeks.",
    author: "Rebecca Torres",
    title: "VP of People Operations",
    company: "Meridian Tech Solutions",
  },
  {
    quote:
      "The match percentage feature is incredibly accurate. When we see an 85%+ match, we know that candidate is worth interviewing. It's saved our HR team countless hours.",
    author: "Michael Chen",
    title: "Head of Talent Acquisition",
    company: "Northpoint Financial",
  },
  {
    quote:
      "As a growing startup, we needed to hire fast without sacrificing quality. WayLay's candidate database gave us access to talent we never would have found through traditional job postings.",
    author: "Amanda Blackwell",
    title: "COO",
    company: "Elevate Consulting Group",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-accent">
            Success Stories
          </p>
          <h2 className="mt-3 font-sans text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            Trusted by Leading Companies
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            See how businesses like yours are using WayLay to build exceptional
            teams faster.
          </p>
        </div>

        {/* Testimonials grid */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="relative flex flex-col p-6 rounded-lg bg-card border border-border"
              >
                <Quote className="h-8 w-8 text-accent/40 mb-4" />
                <blockquote className="flex-1">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {`"${testimonial.quote}"`}
                  </p>
                </blockquote>
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="font-semibold text-sm text-foreground">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {testimonial.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company logos placeholder */}
        <div className="mx-auto mt-16 max-w-4xl">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by HR teams at companies of all sizes
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {["Meridian", "Northpoint", "Elevate", "Apex", "Summit"].map(
              (company, index) => (
                <span
                  key={index}
                  className="text-lg font-semibold text-muted-foreground/50 tracking-wide"
                >
                  {company}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
