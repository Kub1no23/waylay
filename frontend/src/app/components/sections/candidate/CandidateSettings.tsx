"use client";

import { useState, useEffect } from "react";
import { Button } from "../../ui/Button";
import { useUser } from "../../../../context/UserContext";

// Icons
function SaveIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
    </svg>
  );
}

function LoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

interface AccountSettings {
  email: string;
  emailNotifications: boolean;
  messageNotifications: boolean;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const initialSettings: AccountSettings = {
  email: "", // Swapped fallback placeholder out
  emailNotifications: true,
  messageNotifications: true,
};

export function CandidateSettings() {
  const { userProfile } = useUser();
  const [settings, setSettings] = useState<AccountSettings>(initialSettings);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);
  const [passwordSaveSuccess, setPasswordSaveSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sync profile context email cleanly with component state
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
    setSettingsSaveSuccess(false);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSavingSettings(false);
    setSettingsSaveSuccess(true);
    setTimeout(() => setSettingsSaveSuccess(false), 3000);
  };

  const handleSavePassword = async () => {
    setPasswordError(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setIsSavingPassword(true);
    setPasswordSaveSuccess(false);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSavingPassword(false);
    setPasswordSaveSuccess(true);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setTimeout(() => setPasswordSaveSuccess(false), 3000);
  };

  const isPasswordFormValid =
    passwordForm.currentPassword &&
    passwordForm.newPassword &&
    passwordForm.confirmPassword;

  return (
    <div className="p-4 lg:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Account Settings */}
        <section className="rounded-xl bg-card border border-border p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">
              Account Settings
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account preferences and notifications.
            </p>
          </div>

          <div className="space-y-4">
            {/* Email (read-only) */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={settings.email || "Loading profile data..."}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-input bg-muted px-3 py-2.5 text-sm text-muted-foreground"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Contact support to change your email address
              </p>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-medium text-foreground">
                Notification Preferences
              </h3>

              <label className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                <div>
                  <span className="block text-sm font-medium text-foreground">
                    New request notifications
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Receive emails when companies reach out
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.emailNotifications}
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      emailNotifications: !prev.emailNotifications,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    settings.emailNotifications ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-background shadow-sm transition-transform ${
                      settings.emailNotifications
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </label>

              <label className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                <div>
                  <span className="block text-sm font-medium text-foreground">
                    Message notifications
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    Receive emails when you get new messages
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.messageNotifications}
                  onClick={() =>
                    setSettings((prev) => ({
                      ...prev,
                      messageNotifications: !prev.messageNotifications,
                    }))
                  }
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
                    settings.messageNotifications ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-background shadow-sm transition-transform ${
                      settings.messageNotifications
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </label>
            </div>

            {/* Save Settings Button */}
            <div className="flex items-center gap-3 pt-2">
              <Button onClick={handleSaveSettings} disabled={isSavingSettings}>
                {isSavingSettings ? (
                  <>
                    <LoaderIcon className="size-4" />
                    Saving...
                  </>
                ) : settingsSaveSuccess ? (
                  <>
                    <CheckIcon className="size-4" />
                    Saved
                  </>
                ) : (
                  <>
                    <SaveIcon className="size-4" />
                    Save Settings
                  </>
                )}
              </Button>
              {settingsSaveSuccess && (
                <span className="text-sm text-muted-foreground">
                  Settings updated
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Change Password */}
        <section className="rounded-xl bg-card border border-border p-5">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-foreground">
              Change Password
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your password to keep your account secure.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-2 block text-sm font-medium text-foreground"
              >
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="Enter your current password"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSavePassword}
                disabled={isSavingPassword || !isPasswordFormValid}
              >
                {isSavingPassword ? (
                  <>
                    <LoaderIcon className="size-4" />
                    Updating...
                  </>
                ) : passwordSaveSuccess ? (
                  <>
                    <CheckIcon className="size-4" />
                    Updated
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
              {passwordSaveSuccess && (
                <span className="text-sm text-muted-foreground">
                  Password changed successfully
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Danger Zone */}
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
              <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">
                  Deactivate Account
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Once you deactivate your account, your profile will be hidden
                  from companies and all pending requests will be declined. You
                  can reactivate by logging in.
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
