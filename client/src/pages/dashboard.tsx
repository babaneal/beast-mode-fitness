import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Trophy, Flame, Calendar } from "lucide-react";
import type { WorkoutLog, PersonalRecord, Exercise } from "@shared/schema";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: logs = [] } = useQuery<WorkoutLog[]>({ queryKey: ["/api/workout-logs"] });
  const { data: prs = [] } = useQuery<PersonalRecord[]>({ queryKey: ["/api/personal-records"] });
  const { data: exercises = [] } = useQuery<Exercise[]>({ queryKey: ["/api/exercises"] });

  const today = format(new Date(), "yyyy-MM-dd");
  const todayLogs = logs.filter((l) => l.date === today);
  const totalVolume = todayLogs.reduce((sum, l) => sum + l.weight * l.reps * l.sets, 0);

  // Calculate streak
  const uniqueDates = [...new Set(logs.map((l) => l.date))].sort().reverse();
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = format(d, "yyyy-MM-dd");
    if (uniqueDates.includes(dateStr)) {
      streak++;
    } else if (i > 0) break;
    d.setDate(d.getDate() - 1);
  }

  const exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e.name]));

  // Last 5 PRs
  const recentPRs = prs.slice(0, 5);

  // Last 7 days volume
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return format(date, "yyyy-MM-dd");
  });
  const volumeByDay = last7.map((date) => {
    const dayLogs = logs.filter((l) => l.date === date);
    return {
      date: format(new Date(date + "T12:00:00"), "EEE"),
      volume: dayLogs.reduce((sum, l) => sum + l.weight * l.reps * l.sets, 0),
    };
  });
  const maxVol = Math.max(...volumeByDay.map((d) => d.volume), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight" data-testid="text-page-title">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your training overview
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card data-testid="card-today-sets">
          <CardContent className="pt-5 pb-4 px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Today's Sets</span>
              <Dumbbell className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold tabular-nums">{todayLogs.length}</p>
          </CardContent>
        </Card>
        <Card data-testid="card-volume">
          <CardContent className="pt-5 pb-4 px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Volume (lbs)</span>
              <Flame className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold tabular-nums">{totalVolume.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card data-testid="card-streak">
          <CardContent className="pt-5 pb-4 px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Streak</span>
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold tabular-nums">{streak} days</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-prs">
          <CardContent className="pt-5 pb-4 px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total PRs</span>
              <Trophy className="w-4 h-4 text-primary" />
            </div>
            <p className="text-2xl font-bold tabular-nums">{prs.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Volume Bar Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Weekly Volume (lbs)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-32">
              {volumeByDay.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/80 rounded-t transition-all"
                    style={{ height: `${Math.max((d.volume / maxVol) * 100, d.volume > 0 ? 4 : 0)}%` }}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium">{d.date}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent PRs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent PRs</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPRs.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-muted-foreground">
                <Trophy className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">No PRs yet. Start logging.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentPRs.map((pr) => (
                  <div
                    key={pr.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                    data-testid={`pr-item-${pr.id}`}
                  >
                    <div>
                      <p className="text-sm font-medium">{exerciseMap[pr.exerciseId] || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">{pr.date}</p>
                    </div>
                    <Badge variant="secondary" className="font-mono tabular-nums">
                      {pr.weight} lbs × {pr.reps}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
