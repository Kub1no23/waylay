import type { CandidateFormData } from "../../../../libs/types";
import { LoaderIcon, ArrowRightIcon, UserIcon } from "lucide-react";

export function CandidateForm({
  data,
  setData,
  onSubmit,
  isLoading,
  error,
}: {
  data: CandidateFormData;
  setData: React.Dispatch<React.SetStateAction<CandidateFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <UserIcon className="h-6 w-6" />
        </div>

        <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
          Create your candidate account
        </h1>

        <p className="mt-2 text-muted-foreground">
          Start building your profile and get discovered by companies
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Name */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              First name
            </label>
            <input
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              value={data.firstName}
              onChange={(e) =>
                setData((p) => ({ ...p, firstName: e.target.value }))
              }
              placeholder="John"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Last name
            </label>
            <input
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              value={data.lastName}
              onChange={(e) =>
                setData((p) => ({ ...p, lastName: e.target.value }))
              }
              placeholder="Smith"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            type="email"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            value={data.email}
            onChange={(e) => setData((p) => ({ ...p, email: e.target.value }))}
            placeholder="john@example.com"
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Password
          </label>
          <input
            type="password"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            value={data.password}
            onChange={(e) =>
              setData((p) => ({ ...p, password: e.target.value }))
            }
            placeholder="At least 8 characters"
          />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Confirm password
          </label>
          <input
            type="password"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            value={data.confirmPassword}
            onChange={(e) =>
              setData((p) => ({ ...p, confirmPassword: e.target.value }))
            }
            placeholder="Confirm your password"
          />
        </div>

        {/* Additional info */}
        <details className="group rounded-lg border border-border bg-card/50">
          <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted/50">
            <span>Additional information (optional)</span>
            <svg
              className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>

          <div className="space-y-4 border-t border-border px-4 py-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Location
              </label>
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                value={data.location}
                onChange={(e) =>
                  setData((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="e.g., Prague, CZ"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Headline
              </label>
              <input
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                value={data.headline}
                onChange={(e) =>
                  setData((p) => ({ ...p, headline: e.target.value }))
                }
                placeholder="e.g., Backend engineer focused on distributed systems"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Summary
              </label>
              <textarea
                rows={3}
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                value={data.summary}
                onChange={(e) =>
                  setData((p) => ({ ...p, summary: e.target.value }))
                }
                placeholder="Short professional summary..."
              />
            </div>

            {/* GitHub URL input field */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                GitHub Profile URL
              </label>
              <input
                type="url"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                value={data.githubUrl}
                onChange={(e) =>
                  setData((p) => ({ ...p, githubUrl: e.target.value }))
                }
                placeholder="https://github.com/yourusername"
              />
            </div>

            {/* Portfolio URL input field */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Portfolio Website URL
              </label>
              <input
                type="url"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                value={data.portfolioUrl}
                onChange={(e) =>
                  setData((p) => ({ ...p, portfolioUrl: e.target.value }))
                }
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </details>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <LoaderIcon className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create account
              <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Terms */}
        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <a href="#" className="underline hover:text-foreground">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-foreground">
            Privacy Policy
          </a>
        </p>
      </form>
    </div>
  );
}
