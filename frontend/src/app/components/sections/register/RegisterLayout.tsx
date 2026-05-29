import { Link } from "react-router-dom";

export function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          {/* Logo */}
          <div className="flex flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="font-sans text-2xl font-bold tracking-tight text-primary pointer">
                WAYLAY
              </span>
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="flex flex-1 justify-end gap-x-4 text-foreground/80">
            <p>
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary hover:text-primary/80 pointer"
              >
                Sign in
              </Link>
            </p>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
