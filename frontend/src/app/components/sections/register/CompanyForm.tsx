import type { CompanyFormData } from "../../../../libs/types";
import { LoaderIcon, ArrowRightIcon, BuildingIcon } from "lucide-react";

export function CompanyForm({
  data,
  setData,
  onSubmit,
  isLoading,
  error,
}: {
  data: CompanyFormData;
  setData: React.Dispatch<React.SetStateAction<CompanyFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
}) {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BuildingIcon className="h-6 w-6" />
          </div>

          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            Create your company account
          </h1>

          <p className="mt-2 text-muted-foreground">
            Set up your company to start finding top talent
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Company name */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Company name
          </label>
          <input
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            value={data.name}
            onChange={(e) => setData((p) => ({ ...p, name: e.target.value }))}
            placeholder="Acme Inc."
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Email
          </label>
          <input
            type="email"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            value={data.email}
            onChange={(e) => setData((p) => ({ ...p, email: e.target.value }))}
            placeholder="hr@company.com"
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
              <label
                htmlFor="regHeadquarters"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Headquarters
              </label>
              <input
                id="regHeadquarters"
                type="text"
                value={data.headquarters}
                onChange={(e) =>
                  setData((p) => ({ ...p, headquarters: e.target.value }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="e.g., New York, NY"
              />
            </div>

            <div>
              <label
                htmlFor="regAddress"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Address
              </label>
              <input
                id="regAddress"
                type="text"
                value={data.address}
                onChange={(e) =>
                  setData((p) => ({ ...p, address: e.target.value }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="e.g., 123 Main St, Suite 100"
              />
            </div>

            <div>
              <label
                htmlFor="regIndustry"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Industry
              </label>
              <textarea
                id="regIndustry"
                rows={3}
                value={data.industry}
                onChange={(e) =>
                  setData((p) => ({ ...p, industry: e.target.value }))
                }
                className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="e.g., Technology, Finance, Healthcare"
              />
            </div>

            <div>
              <label
                htmlFor="regDescription"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Description
              </label>
              <textarea
                id="regDescription"
                rows={3}
                value={data.description}
                onChange={(e) =>
                  setData((p) => ({ ...p, description: e.target.value }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="Describe your company, culture, and what makes you unique."
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
      </form>
      <p className="text-center text-xs text-muted-foreground mt-6">
        By creating an account, you agree to our{" "}
        <a href="#" className="underline hover:text-foreground">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-foreground">
          Privacy Policy
        </a>
      </p>
    </>
  );
}
