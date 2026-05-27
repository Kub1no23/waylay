"use client";

import { useState, useEffect } from "react";
import { Button } from "../../../components/ui/Button";
import { Save, Loader2, Check, AlertTriangle } from "lucide-react";
import { useUser } from "../../../../context/UserContext";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ToggleProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  description: string;
}

function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
      <div>
        <span className="block text-sm font-medium text-foreground">
          {label}
        </span>
        <span className="block text-xs text-muted-foreground">
          {description}
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-background shadow-sm transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </label>
  );
}

export default function CompanySettings() {
  const { userProfile } = useUser();

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    email: "",
    newCandidateNotifications: true,
    messageNotifications: true,
  });

  // Automatically load the logged-in user's email once the user profile context is available
  useEffect(() => {
    if (userProfile?.email) {
      setSettings((prev) => ({
        ...prev,
        email: userProfile.email,
      }));
    }
  }, [userProfile]);

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsSaved(false);

    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsSavingSettings(false);
    setSettingsSaved(true);

    setTimeout(() => {
      setSettingsSaved(false);
    }, 3000);
  };

  const handleSavePassword = async () => {
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setIsSavingPassword(true);
    setPasswordSaved(false);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSavingPassword(false);
    setPasswordSaved(true);

    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setTimeout(() => {
      setPasswordSaved(false);
    }, 3000);
  };

  const toggleSetting = (
    key: "newCandidateNotifications" | "messageNotifications",
  ) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isPasswordValid =
    passwordForm.currentPassword &&
    passwordForm.newPassword &&
    passwordForm.confirmPassword;

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">
              Account Settings
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account preferences and notifications.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Email Address
              </label>
              <input
                type="email"
                value={settings.email || "Loading account info..."}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-input bg-muted px-3 py-2.5 text-sm text-muted-foreground animate-none"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Contact support to change your email
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-medium text-foreground">
                Notifications
              </h3>

              <Toggle
                checked={settings.newCandidateNotifications}
                label="New candidate notifications"
                description="Get notified when candidates apply"
                onChange={() => toggleSetting("newCandidateNotifications")}
              />

              <Toggle
                checked={settings.messageNotifications}
                label="Message notifications"
                description="Get notified for new messages"
                onChange={() => toggleSetting("messageNotifications")}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                {isSavingSettings ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : settingsSaved ? (
                  <>
                    <Check className="size-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Save Settings
                  </>
                )}
              </Button>

              {settingsSaved && (
                <span className="text-sm text-muted-foreground">
                  Settings updated
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">
              Change Password
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep your account secure.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Current Password
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                placeholder="Enter current password"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="New password"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="Confirm password"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                />
              </div>
            </div>

            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSavePassword}
                disabled={isSavingPassword || !isPasswordValid}
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Updating...
                  </>
                ) : passwordSaved ? (
                  <>
                    <Check className="size-4" />
                    Updated
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>

              {passwordSaved && (
                <span className="text-sm text-muted-foreground">
                  Password changed
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-destructive">
              Danger Zone
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Irreversible and destructive actions.
            </p>
          </div>

          <div className="rounded-lg border border-destructive/20 bg-background p-4">
            <div className="flex items-start gap-4">
              <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />

              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">
                  Deactivate Account
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your company profile will be hidden and all pending outreach
                  will be cancelled. You can reactivate by logging in.
                </p>
                <Button variant="destructive" size="sm" className="mt-4">
                  Deactivate Account
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
