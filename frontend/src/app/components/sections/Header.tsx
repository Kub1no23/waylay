import { useState } from "react";
import { Button } from "../ui/Button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        {/* Logo */}
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5">
            <span className="font-sans text-2xl font-bold tracking-tight text-primary">
              WayLay
            </span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex lg:gap-x-10">
          <Link
            to="#how-it-works"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            How It Works
          </Link>
          <Link
            to="#features"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            For Businesses
          </Link>
          <Link
            to="#matching"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Matching
          </Link>
          <Link
            to="#testimonials"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Success Stories
          </Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          <Button variant="ghost" className="text-sm font-medium">
            Sign In
          </Button>
          <Link to="/register">
            <Button className="text-sm font-medium">Get Started</Button>
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="space-y-1 px-6 pb-4 pt-2">
            <a
              href="#how-it-works"
              className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              How It Works
            </a>
            <a
              href="#features"
              className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              For Businesses
            </a>
            <a
              href="#matching"
              className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Matching
            </a>
            <a
              href="#testimonials"
              className="block rounded-lg px-3 py-2 text-base font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              Success Stories
            </a>
            <div className="mt-4 flex flex-col gap-2">
              <Button variant="ghost" className="w-full justify-center">
                Sign In
              </Button>
              <Button className="w-full justify-center">Get Started</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
