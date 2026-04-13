import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp } from "lucide-react";
import type { Exercise, PersonalRecord } from "@shared/schema";

export default function PRTracker() {
  const { data: prs = [] } = useQuery<PersonalRecord[]>({ queryKey: ["/api/personal-records"] });
  const { data: exercises = [] } = useQuery<Exercise[]>({ queryKey: ["/api/exercises"] });

  const exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e]));

  // Group PRs by exercise, show best PR per exercise
  const bestPRs = new Map<number, PersonalRecord>();
  for (const pr of prs) {
    const existing = bestPRs.get(pr.exerciseId);
    if (!existing || pr.weight > existing.weight) {
      bestPRs.set(pr.exerciseId, pr);
    }
  }

  // Group by category
  const grouped: Record<string, { exercise: Exercise; pr: PersonalRecord }[]> = {};
  for (const [exerciseId, pr] of bestPRs) {
    const ex = exerciseMap[exerciseId];
    if (!ex) continue;
    if (!grouped[ex.category]) grouped[ex.category] = [];
    grouped[ex.category].push({ exercise: ex, pr });
  }

  // Sort each group by weight descending
  for (const cat of Object.keys(grouped)) {
    grouped[cat].sort((a, b) => b.pr.weight - a.pr.weight);
  }

  const categoryLabels: Record<string, string> = {
    push: "Push",
    pull: "Pull",
    legs: "Legs",
  };

  const categoryColors: Record<string, string> = {
    push: "bg-red-500/15 text-red-400 border-red-500/20",
    pull: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    legs: "bg-green-500/15 text-green-400 border-green-500/20",
  };

  // PRs timeline
  const recentPRs = [...prs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight" data-testid="text-page-title">
          PR Tracker
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Personal records across all exercises
        </p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center text-muted-foreground">
              <Trophy className="w-10 h-10 mb-3 opacity-40" />
              <h3 className="text-base font-semibold text-foreground mb-1">No PRs Yet</h3>
              <p className="text-sm max-w-sm">
                Log workouts and save your best sets as PRs. They'll appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Best PRs by category */}
          <div className="space-y-4">
            {Object.entries(grouped).map(([cat, items]) => (
              <Card key={cat}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-semibold">
                      {categoryLabels[cat] || cat} PRs
                    </CardTitle>
                    <Badge variant="outline" className={`text-[10px] ${categoryColors[cat] || ""}`}>
                      {items.length} exercises
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0 divide-y divide-border">
                    {items.map(({ exercise, pr }) => (
                      <div
                        key={exercise.id}
                        className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                        data-testid={`best-pr-${exercise.id}`}
                      >
                        <div>
                          <p className="text-sm font-medium">{exercise.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">{exercise.muscleGroup}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold font-mono tabular-nums text-primary">
                            {pr.weight} lbs
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            × {pr.reps} reps
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* PR Timeline */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold">PR Timeline</CardTitle>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentPRs.map((pr, i) => {
                  const ex = exerciseMap[pr.exerciseId];
                  return (
                    <div key={pr.id} className="flex items-start gap-3" data-testid={`timeline-pr-${pr.id}`}>
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5" />
                        {i < recentPRs.length - 1 && (
                          <div className="w-px h-full bg-border flex-1 min-h-[20px]" />
                        )}
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-medium">
                          {ex?.name || "Unknown"} — {pr.weight} lbs × {pr.reps}
                        </p>
                        <p className="text-xs text-muted-foreground">{pr.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
