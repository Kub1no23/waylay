import { ScrollArea } from "../../../components/ui/ScrollArea";

export default function CompanyProfile() {
  const company = {
    name: "TechCorp",
    industry: "Technology",
    size: "100-500 employees",
    founded: "2015",
    website: "https://techcorp.example.com",
    description: "Leading innovators in AI and machine learning solutions.",
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 lg:p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {company.name}
            </h2>
            <p className="text-muted-foreground mb-4">{company.description}</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Industry</p>
                <p className="text-sm font-medium text-foreground mt-1">
                  {company.industry}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Company Size</p>
                <p className="text-sm font-medium text-foreground mt-1">
                  {company.size}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Founded</p>
                <p className="text-sm font-medium text-foreground mt-1">
                  {company.founded}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Website</p>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline mt-1"
                >
                  Visit
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
