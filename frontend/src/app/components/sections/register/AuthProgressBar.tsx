import { cn } from "../../../../libs/utils";
import type { RegisterProgressState } from "../../../utils/registerProgress";

export function AuthProgressBar({ state }: { state: RegisterProgressState }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center gap-2">
        {/* Step 1: Account type selected */}
        <div
          className={cn(
            "h-2 w-16 rounded-full transition-colors",
            state.accountTypeSelected ? "bg-primary" : "bg-primary/50",
          )}
        />

        {/* Step 2: Registration completed */}
        <div
          className={cn(
            "h-2 w-16 rounded-full transition-colors",
            state.isRegistered ? "bg-primary" : "bg-border",
          )}
        />

        {/* Step 3: Profile completed */}
        <div
          className={cn(
            "h-2 w-16 rounded-full transition-colors",
            state.profileCompleted ? "bg-primary" : "bg-border",
          )}
        />
      </div>
    </div>
  );
}
