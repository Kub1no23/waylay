import { Check, Sparkles } from "lucide-react";

const matchFactors = [
  "Skills and technical competencies",
  "Years of relevant experience",
  "Industry background",
  "Educational qualifications",
  "Location and remote preferences",
  "Salary expectations alignment",
  "Availability timeline",
];

export default function MatchSection() {
  return (
    <section
      id="matching"
      className="py-20 sm:py-28 bg-primary text-primary-foreground"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Content */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" />
              Intelligent Matching
            </div>

            <h2 className="font-sans text-3xl font-bold tracking-tight sm:text-4xl text-balance">
              Precision Matching That Saves Time
            </h2>

            <p className="mt-4 text-lg leading-relaxed text-primary-foreground/80">
              Our proprietary matching algorithm analyzes candidate profiles
              against your job requirements to deliver a clear percentage match.
              Data-driven recommendations you can trust.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-3">
              {matchFactors.map((factor, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent">
                    <Check className="h-3 w-3 text-accent-foreground" />
                  </div>
                  <span className="text-sm text-primary-foreground/90">
                    {factor}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Visual */}
          <div className="relative">
            <div className="relative rounded-lg bg-primary-foreground/10 backdrop-blur p-8">
              {/* Match percentage visualization */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center">
                  <div className="relative">
                    <svg className="w-40 h-40 transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-primary-foreground/20"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray="440"
                        strokeDashoffset="66"
                        strokeLinecap="round"
                        className="text-accent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-4xl font-bold">85%</span>
                        <p className="text-xs text-primary-foreground/70 mt-1">
                          Match Score
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sample breakdown */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Technical Skills</span>
                    <span>92%</span>
                  </div>
                  <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: "92%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Experience Level</span>
                    <span>88%</span>
                  </div>
                  <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: "88%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Salary alignment</span>
                    <span>78%</span>
                  </div>
                  <div className="h-2 bg-primary-foreground/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: "78%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
