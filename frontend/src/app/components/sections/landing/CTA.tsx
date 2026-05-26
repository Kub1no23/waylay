import { Button } from "../../ui/Button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function CTA() {
  return (
    <section className="py-20 sm:py-28 bg-card">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-2xl bg-primary px-6 py-16 sm:px-12 sm:py-20 lg:px-16">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute -top-20 -right-20 h-[400px] w-[400px] rounded-full bg-accent/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-[300px] w-[300px] rounded-full bg-primary-foreground/5 blur-3xl" />
          </div>

          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-sans text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl text-balance">
              Ready to Transform Your Hiring?
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-primary-foreground/80">
              Join thousands of businesses already using WayLay to discover
              qualified candidates faster. Create your business profile today
              and start searching our talent database.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/register">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-base px-8 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                >
                  Create Business Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-sm text-primary-foreground/60">
              Free to get started. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
