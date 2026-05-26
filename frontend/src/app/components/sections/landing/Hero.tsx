import { Link } from "react-router-dom";
import { Button } from "../../ui/Button";
import { ArrowRight, Building2, Users } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-8 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium text-secondary-foreground mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Recruitment, Reimagined
            </div>

            <h1 className="font-sans text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl text-balance leading-tight">
              Where Talent Meets{" "}
              <span className="text-accent">Opportunity</span>
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              WayLay flips recruiting on its head. Candidates showcase their
              skills and experience, while businesses search our curated talent
              pool to find perfect matches. All powered by intelligent %
              matching technology.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="text-base px-8">
                  Start Matching
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="text-base px-8"
                onClick={() =>
                  document.getElementById("how-it-works")?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
              >
                See How It Works
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>2,400+ Businesses</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>185,000+ Candidates</span>
              </div>
            </div>
          </div>

          {/* Right column - Visual */}
          <div className="relative lg:pl-8">
            <div className="relative rounded-lg bg-card border border-border shadow-lg overflow-hidden">
              {/* Mock dashboard header */}
              <div className="bg-primary/5 px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-foreground">
                    Candidate Matches
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Updated just now
                  </span>
                </div>
              </div>

              {/* Mock candidate cards */}
              <div className="p-6 space-y-4">
                {[
                  {
                    name: "Jakub Zlamal",
                    role: "Junior Backend Developer",
                    match: 94,
                  },
                  {
                    name: "Vit Sobisek",
                    role: "Junior Frontend Developer",
                    match: 91,
                  },
                  {
                    name: "Violet Evergarden",
                    role: "Security Engineer",
                    match: 87,
                  },
                ].map((candidate, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {candidate.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm text-foreground">
                          {candidate.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {candidate.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-primary">
                          {candidate.match}%
                        </p>
                        <p className="text-xs text-muted-foreground">Match</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative elements - minimal */}
            <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-xl bg-primary/5 -z-10" />
            <div className="absolute -top-4 -left-4 h-14 w-14 rounded-xl bg-accent/10 -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}
