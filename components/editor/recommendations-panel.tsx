"use client";

import { addRecommendation, deleteRecommendation, toggleRecommendationIncluded } from "@/app/admin/reports/[id]/editor/actions";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Select, FieldGroup } from "@/components/ui/field";

type Recommendation = {
  id: string;
  text: string;
  owner: "client" | "lpm" | "shared";
  included: boolean;
};

export function RecommendationsPanel({
  reportId,
  recommendations,
}: {
  reportId: string;
  recommendations: Recommendation[];
}) {
  const addAction = addRecommendation.bind(null, reportId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
        <span className="text-xs text-[#8b95a1]">Keep to the strongest 3–4</span>
      </CardHeader>

      <div className="mb-4 space-y-2">
        {recommendations.map((rec) => (
          <div key={rec.id} className="flex items-start justify-between gap-2 rounded-md border border-border-subtle p-3">
            <div className="flex items-start gap-2">
              <Badge tone={rec.owner === "lpm" ? "lpm" : rec.owner === "client" ? "client" : "pink"}>
                {rec.owner}
              </Badge>
              <p className="text-sm">{rec.text}</p>
            </div>
            <div className="flex shrink-0 gap-2 text-xs">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  defaultChecked={rec.included}
                  onChange={(e) => toggleRecommendationIncluded(reportId, rec.id, e.target.checked)}
                />
                Included
              </label>
              <button
                className="font-medium text-[#c02929] hover:underline"
                onClick={() => deleteRecommendation(reportId, rec.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {recommendations.length === 0 && <p className="text-sm text-[#8b95a1]">No recommendations yet.</p>}
      </div>

      <form action={addAction} className="flex gap-2">
        <FieldGroup className="mb-0 flex-1">
          <Input name="text" placeholder="Add a recommendation…" required />
        </FieldGroup>
        <FieldGroup className="mb-0 w-32">
          <Select name="owner" defaultValue="lpm">
            <option value="lpm">LPM</option>
            <option value="client">Client</option>
            <option value="shared">Shared</option>
          </Select>
        </FieldGroup>
        <Button type="submit" size="sm">
          Add
        </Button>
      </form>
    </Card>
  );
}
