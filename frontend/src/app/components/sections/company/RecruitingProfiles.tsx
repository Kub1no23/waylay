import { useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Plus, Pencil, Archive, X, Save, Loader2 } from "lucide-react";

interface Profile {
  id: string;
  title: string;
  skills: string[];
  seniority: string;
  jobType: string;
  location: string;
  remote: string;
  description: string;
  status: "active" | "archived";
}

const emptyProfile: Omit<Profile, "id" | "status"> = {
  title: "",
  skills: [],
  seniority: "Mid-level",
  jobType: "Full-time",
  location: "",
  remote: "Hybrid",
  description: "",
};

export default function RecruitingProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] =
    useState<Omit<Profile, "id" | "status">>(emptyProfile);
  const [skillInput, setSkillInput] = useState("");
  const [saving, setSaving] = useState(false);

  const startNew = () => {
    setEditing("new");
    setForm(emptyProfile);
    setSkillInput("");
  };

  const startEdit = (profile: Profile) => {
    setEditing(profile.id);
    setForm({
      title: profile.title,
      skills: profile.skills,
      seniority: profile.seniority,
      jobType: profile.jobType,
      location: profile.location,
      remote: profile.remote,
      description: profile.description,
    });
    setSkillInput("");
  };

  const cancel = () => {
    setEditing(null);
    setForm(emptyProfile);
    setSkillInput("");
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !form.skills.includes(skill)) {
      setForm((prev) => ({
        ...prev,
        skills: [...prev.skills, skill],
      }));
    }
    setSkillInput("");
  };

  const removeSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 800));

    if (editing === "new") {
      setProfiles((prev) => [
        ...prev,
        {
          ...form,
          id: `profile-${Date.now()}`,
          status: "active",
        },
      ]);
    } else {
      setProfiles((prev) =>
        prev.map((p) => (p.id === editing ? { ...p, ...form } : p)),
      );
    }

    setEditing(null);
    setForm(emptyProfile);
    setSkillInput("");
    setSaving(false);
  };

  const archive = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: p.status === "active" ? "archived" : "active",
            }
          : p,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Recruiting Profiles
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Define roles and requirements used for candidate matching.
          </p>
        </div>

        <Button size="sm" onClick={startNew}>
          <Plus className="size-4" />
          New Role
        </Button>
      </div>

      {editing && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            {editing === "new" ? "New Recruiting Profile" : "Edit Profile"}
          </h3>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Role Title
            </label>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="e.g. Senior Frontend Engineer"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Seniority
              </label>
              <select
                value={form.seniority}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    seniority: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                {["Junior", "Mid-level", "Senior", "Lead", "Principal"].map(
                  (level) => (
                    <option key={level}>{level}</option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Job Type
              </label>
              <select
                value={form.jobType}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    jobType: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                {["Full-time", "Part-time", "Contract", "Internship"].map(
                  (type) => (
                    <option key={type}>{type}</option>
                  ),
                )}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Location
              </label>
              <input
                value={form.location}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Remote Policy
              </label>
              <select
                value={form.remote}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    remote: e.target.value,
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
              >
                {["Remote only", "Hybrid", "On-site", "Flexible"].map(
                  (remote) => (
                    <option key={remote}>{remote}</option>
                  ),
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Skills / Attributes
            </label>

            <div className="mb-2 flex gap-2">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSkill()}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
                placeholder="Type a skill and press Enter"
              />

              <Button size="sm" variant="outline" onClick={addSkill}>
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {form.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium"
                >
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Description
            </label>

            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
              placeholder="Describe the role and what you're looking for..."
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleSave}
              disabled={saving || !form.title.trim()}
            >
              {saving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Profile
                </>
              )}
            </Button>

            <Button variant="outline" onClick={cancel}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            className={`rounded-xl border border-border bg-card p-4 ${
              profile.status === "archived" ? "opacity-60" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {profile.title}
                  </h3>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      profile.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {profile.status}
                  </span>
                </div>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  {profile.seniority} · {profile.jobType} · {profile.remote}
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
                  className="size-8"
                  onClick={() => archive(profile.id)}
                >
                  <Archive className="size-3.5" />
                </Button>
              </div>
            </div>

            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {profile.description}
            </p>

            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {profile.skills?.map((skill: string) => (
                <span
                  key={skill}
                  className="rounded-md border border-border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
