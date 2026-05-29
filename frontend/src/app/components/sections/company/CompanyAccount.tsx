import { useState, useEffect } from "react";
import { API } from "../../../../api/auth"; // path preserved exactly
import { ScrollArea } from "../../../components/ui/ScrollArea";
import { Button } from "../../../components/ui/Button";
import { Pencil, Save, X, Loader2, Mail, MapPin } from "lucide-react";

interface CompanyData {
  id: number;
  email: string;
  name: string;
  headquarters: string;
  address: string;
  industry: string;
  description: string;
}

export default function CompanyAccount() {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    email: "",
    name: "",
    headquarters: "",
    address: "",
    industry: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Helper helper to dynamically extract userId from JWT token claims
  const getUserIdFromToken = (): number | null => {
    try {
      const token = localStorage.getItem("token"); // or wherever your app stores the bearer token
      if (!token) return null;
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      const decoded = JSON.parse(jsonPayload);
      // Look for standard sub or Microsoft NameIdentifier claims
      const userId =
        decoded.sub ||
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ];
      return userId ? parseInt(userId, 10) : null;
    } catch (e) {
      console.error("Failed to parse identity claims from token context:", e);
      return null;
    }
  };

  useEffect(() => {
    async function fetchAccountData() {
      const targetId = getUserIdFromToken();
      if (!targetId) {
        setErrorMsg("Authentication context missing. Please sign in again.");
        return;
      }

      setLoading(true);
      try {
        const res = await API.get(`/user/company/${targetId}`);
        setCompany(res.data);
        populateForm(res.data);
      } catch (err) {
        console.error("Failed to sync account telemetry:", err);
        setErrorMsg("Could not fetch company account data.");
      } finally {
        setLoading(false);
      }
    }
    fetchAccountData();
  }, []);

  const populateForm = (data: CompanyData) => {
    setForm({
      email: data.email || "",
      name: data.name || "",
      headquarters: data.headquarters || "",
      address: data.address || "",
      industry: data.industry || "",
      description: data.description || "",
    });
  };

  const handleCancel = () => {
    if (company) populateForm(company);
    setIsEditing(false);
    setErrorMsg(null);
  };

  const handleSave = async () => {
    if (saving || !form.name.trim() || !form.email.trim()) return;

    setSaving(true);
    setErrorMsg(null);
    try {
      // Send changes directly to the role-guarded PUT mapping
      await API.put("/user/company", form);

      // Merge variations locally to maintain strict visual parity
      const updatedCompany = { ...company, ...form } as CompanyData;
      setCompany(updatedCompany);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Account change operation rejected:", err);
      if (err.response?.data) {
        setErrorMsg(
          typeof err.response.data === "string"
            ? err.response.data
            : "Invalid request data.",
        );
      } else {
        setErrorMsg("Failed to update account properties.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollArea className="h-full">
      {/* FIXED: Added 'relative z-10' here to pull the view layers above 
        the parent absolute background layout mesh.
      */}
      <div className="relative z-10 p-4 lg:p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          {errorMsg && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive font-medium">
              {errorMsg}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : isEditing ? (
            /* ACCOUNT EDITOR INPUTS */
            <div className="rounded-xl border border-border bg-card p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                  Edit Company Profile
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={handleCancel}
                >
                  <X className="size-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-2 flex items-center text-sm font-medium text-foreground"
                    >
                      Company Name
                      <span
                        className="text-destructive ml-0.5 text-xs"
                        aria-hidden="true"
                      >
                        *
                      </span>
                    </label>
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="e.g. Acme Corporation"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Office Address
                    </label>
                    <input
                      value={form.address}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      placeholder="e.g. 123 Innovation Way, Suite 400"
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Headquarters
                    </label>
                    <input
                      value={form.headquarters}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          headquarters: e.target.value,
                        }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                      placeholder="e.g. London, UK"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Industry
                  </label>
                  <input
                    value={form.industry}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        industry: e.target.value,
                      }))
                    }
                    placeholder="e.g. Financial Technology / SaaS"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Short Company Description
                  </label>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Provide a high-level summary of your core operations, engineering vision, and company culture"
                    className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-border">
                <Button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim() || !form.email.trim()}
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  Save Account Properties
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            company && (
              /* ACTIVE VIEW READ MODE */
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm relative">
                <div className="absolute right-6 top-6">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="size-3.5" /> Edit Account Settings
                  </Button>
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-1 pr-36">
                  {company.name}
                </h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Mail className="size-3.5" /> {company.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5" />{" "}
                    {company.headquarters || "No HQ Specified"}
                  </span>
                </div>

                <p className="text-muted-foreground mb-6 whitespace-pre-wrap text-sm leading-relaxed">
                  {company.description ||
                    "No core summary operational record declared."}
                </p>

                <div className="grid gap-4 sm:grid-cols-2 border-t border-border pt-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Industry Vector
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      {company.industry || "Unassigned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Registered Facilities Address
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">
                      {company.address || "No billing address appended."}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </ScrollArea>
  );
}
