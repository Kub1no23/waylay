import { useState, useEffect } from "react";
import { API } from "../../../../api/auth"; // this path is correct do not change
import { Button } from "../../../components/ui/Button";
import { Plus, Pencil, Trash2, X, Save, Loader2, Search } from "lucide-react";

interface FlagItem {
  id: number;
  name: string;
  category?: string;
}

interface Profile {
  id: number;
  title: string;
  summary: string;
  location: string;
  remotePreference: string;
  yearsExperience: number;
  isActive: boolean;
  flags: FlagItem[]; // Track explicit objects bound to DB IDs
}

const emptyProfile = {
  title: "",
  summary: "",
  location: "",
  remotePreference: "Hybrid",
  yearsExperience: 0,
  flags: [] as FlagItem[],
};

export default function RecruitingProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState(emptyProfile);

  // Search & Debounce States
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<FlagItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initial Data Load
  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true);
      try {
        const res = await API.get("/profile/my");
        setProfiles(res.data);
      } catch (err) {
        console.error("Failed to fetch profiles:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfiles();
  }, []);

  // 1. DEBOUNCED AUTOMATIC SEARCH LOGIC
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);

    // Setup debouncing timeout (300ms window)
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await API.get(`/flag`, {
          params: { q: searchQuery, page: 1 },
        });
        // Filter out flags that have already been selected in the form
        const filtered = (res.data.data || []).filter(
          (suggested: FlagItem) =>
            !form.flags.some((f) => f.id === suggested.id),
        );
        setSuggestions(filtered);
      } catch (err) {
        console.error("Error fetching autofill tags:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    // Cleanup hook resets timer if user presses another key before 300ms expires
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, form.flags]);

  const selectSuggestion = (flag: FlagItem) => {
    setForm((prev) => ({
      ...prev,
      flags: [...prev.flags, flag],
    }));
    setSearchQuery("");
    setSuggestions([]);
  };

  const removeFlag = (flagId: number) => {
    setForm((prev) => ({
      ...prev,
      flags: prev.flags.filter((f) => f.id !== flagId),
    }));
  };

  // 2. SAVE OPERATIONS WITH TRANSACTIONAL FLAG SYNC
  const handleSave = async () => {
    // Strict early exit guard to completely block click spamming
    if (saving || !form.title.trim()) return;

    setSaving(true);
    try {
      let savedProfile: Profile;

      if (editing === "new") {
        // Step A: Create base profile
        const profileRes = await API.post("/profile", {
          title: form.title,
          summary: form.summary,
          location: form.location,
          remotePreference: form.remotePreference,
          yearsExperience: form.yearsExperience,
        });

        // FIX: Safely unpack database object context if wrapped by the API layer
        savedProfile = profileRes.data.profile || profileRes.data;

        // Step B: Multi-assign chosen flag weights to profile id
        if (form.flags.length > 0 && savedProfile.id) {
          const flagPayload: Record<number, number> = {};
          form.flags.forEach((f) => {
            flagPayload[f.id] = 1.0;
          });

          await API.post(`/profile/${savedProfile.id}/flag`, {
            flags: flagPayload,
          });
        }

        savedProfile.flags = form.flags || [];
        setProfiles((prev) => [...prev, savedProfile]);
      } else if (typeof editing === "number") {
        // Step A: Update baseline info
        const profileRes = await API.put(`/profile/${editing}`, {
          title: form.title,
          summary: form.summary,
          location: form.location,
          remotePreference: form.remotePreference,
          yearsExperience: form.yearsExperience,
          isActive: true,
        });
        savedProfile = profileRes.data.profile || profileRes.data;

        // Step B: Reconcile flag additions vs removals
        const originalProfile = profiles.find((p) => p.id === editing);
        const originalFlags = originalProfile?.flags || [];

        const flagsToRemove = originalFlags
          .filter((orig) => !form.flags.some((f) => f.id === orig.id))
          .map((f) => f.id);

        const flagsToAdd = form.flags.filter(
          (f) => !originalFlags.some((orig) => orig.id === f.id),
        );

        if (flagsToRemove.length > 0) {
          await API.delete(`/profile/${editing}/flag`, {
            data: { flagIds: flagsToRemove },
          });
        }

        if (flagsToAdd.length > 0) {
          const flagPayload: Record<number, number> = {};
          flagsToAdd.forEach((f) => {
            flagPayload[f.id] = 1.0;
          });
          await API.post(`/profile/${editing}/flag`, { flags: flagPayload });
        }

        savedProfile.flags = form.flags || [];
        setProfiles((prev) =>
          prev.map((p) => (p.id === editing ? savedProfile : p)),
        );
      }

      // Clear layout and return cleanly back to view stream
      setEditing(null);
      setForm(emptyProfile);
      setSearchQuery("");
    } catch (err) {
      console.error("Error resolving profile flag save transaction:", err);
    } finally {
      setSaving(false);
    }
  };

  // 3. DELETE PROFILE HANDLER
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this profile?"))
      return;
    try {
      await API.delete(`/profile/${id}`);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting profile:", err);
    }
  };

  const startEdit = (profile: Profile) => {
    setEditing(profile.id);
    setForm({
      title: profile.title || "",
      summary: profile.summary || "",
      location: profile.location || "",
      remotePreference: profile.remotePreference || "Hybrid",
      yearsExperience: profile.yearsExperience || 0,
      flags: profile.flags || [],
    });
    setSearchQuery("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Recruiting Profiles
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Construct roles using synchronized system-level metadata flags.
          </p>
        </div>
        {!editing && (
          <Button
            size="sm"
            onClick={() => {
              setEditing("new");
              setForm(emptyProfile);
            }}
          >
            <Plus className="size-4" /> New Role
          </Button>
        )}
      </div>

      {editing && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">
            {editing === "new"
              ? "Build Profile Setup"
              : "Modify Core Properties"}
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Role Title
              </label>
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="e.g. Fullstack Engineer"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Years of Experience Required
              </label>
              <input
                type="number"
                value={form.yearsExperience}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    yearsExperience: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                min="0"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Target Workplace Location
              </label>
              <input
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, location: e.target.value }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Remote Allocation Policy
              </label>
              <select
                value={form.remotePreference}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    remotePreference: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                {["Remote", "Hybrid", "Onsite"].map((policy) => (
                  <option key={policy} value={policy}>
                    {policy}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DEBOUNCED AUTOFILL INPUT COMPONENT */}
          <div className="relative">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Assign Matching System Flags
            </label>
            <div className="relative flex items-center">
              <Search className="absolute left-3 size-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="Type a skill/trait to see recommended system criteria..."
              />
              {isSearching && (
                <Loader2 className="absolute right-3 size-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {/* Suggestions Overlay Dropdown */}
            {suggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-border bg-popover py-1 shadow-lg">
                {suggestions.map((flag) => (
                  <li key={flag.id}>
                    <button
                      type="button"
                      onClick={() => selectSuggestion(flag)}
                      className="w-full px-3 py-2 text-left text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground flex justify-between items-center"
                    >
                      <span>{flag.name}</span>
                      {flag.category && (
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {flag.category}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Currently Appended Form Badges */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {form.flags.map((flag) => (
                <span
                  key={flag.id}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  {flag.name}
                  <button
                    type="button"
                    onClick={() => removeFlag(flag.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Summary Outline
            </label>
            <textarea
              rows={3}
              value={form.summary}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, summary: e.target.value }))
              }
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Commit Changes
            </Button>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* DASHBOARD MANAGEMENT FEED */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {profile.title}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {profile.yearsExperience} Yrs · {profile.location} ·{" "}
                    {profile.remotePreference}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => startEdit(profile)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(profile.id)}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                {profile.summary}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {profile.flags?.map((flag) => (
                  <span
                    key={flag.id}
                    className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
                  >
                    {flag.name}
                  </span>
                ))}
              </div>
            </div>
          ))}

          {profiles.length === 0 && (
            <div className="text-center py-8 border border-dashed rounded-xl text-muted-foreground text-sm">
              No profiles configured. Click "New Role" to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
