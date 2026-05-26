import { cn } from "../../../../libs/utils";
import type { AccountType } from "../../../../libs/types";
import {
  CheckIcon,
  UserIcon,
  BuildingIcon,
  ArrowRightIcon,
} from "lucide-react";

export function AccountTypeStep({
  accountType,
  onSelect,
  onContinue,
}: {
  accountType: AccountType;
  onSelect: (type: AccountType) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-sans text-3xl font-bold tracking-tight text-foreground">
          Create your account
        </h1>
        <p className="mt-2 text-muted-foreground">
          Choose how you want to use WayLay
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Candidate */}
        <button
          type="button"
          onClick={() => onSelect("candidate")}
          className={cn(
            "group relative flex flex-col items-center gap-4 rounded-xl border-2 p-6 text-left transition-all hover:border-primary/50 hover:bg-card",
            accountType === "candidate"
              ? "border-primary bg-card shadow-sm"
              : "border-border bg-background",
          )}
        >
          {accountType === "candidate" && (
            <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
              <CheckIcon className="h-4 w-4 text-primary-foreground" />
            </div>
          )}

          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-xl transition-colors",
              accountType === "candidate"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground group-hover:bg-primary/10",
            )}
          >
            <UserIcon className="h-7 w-7" />
          </div>

          <div className="text-center">
            <h3 className="font-sans text-lg font-semibold text-foreground">
              I&apos;m a Candidate
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a profile about yourself and let companies discover you
            </p>
          </div>
        </button>

        {/* Company */}
        <button
          type="button"
          onClick={() => onSelect("company")}
          className={cn(
            "group relative flex flex-col items-center gap-4 rounded-xl border-2 p-6 text-left transition-all hover:border-primary/50 hover:bg-card",
            accountType === "company"
              ? "border-primary bg-card shadow-sm"
              : "border-border bg-background",
          )}
        >
          {accountType === "company" && (
            <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary">
              <CheckIcon className="h-4 w-4 text-primary-foreground" />
            </div>
          )}

          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-xl transition-colors",
              accountType === "company"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground group-hover:bg-primary/10",
            )}
          >
            <BuildingIcon className="h-7 w-7" />
          </div>

          <div className="text-center">
            <h3 className="font-sans text-lg font-semibold text-foreground">
              I&apos;m a Company
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Search for candidates and find the perfect match for your roles
            </p>
          </div>
        </button>
      </div>

      <button
        type="button"
        onClick={onContinue}
        disabled={!accountType}
        className={cn(
          "flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors",
          accountType
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "cursor-not-allowed bg-muted text-muted-foreground",
        )}
      >
        Continue
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
