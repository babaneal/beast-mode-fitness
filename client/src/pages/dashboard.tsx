import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dumbbell,
  Trophy,
  Flame,
  Calendar,
  Target,
  Droplets,
  Moon,
  Footprints,
  Pill,
  TrendingDown,
  ChevronRight,
  Timer,
  Bike,
} from "lucide-react";
import type { WorkoutLog, PersonalRecord, Exercise } from "@shared/schema";
import { format, differenceInCalendarWeeks, isWithinInterval } from "date-fns";

// Program bounds
const PROGRAM_START = new Date(2026, 3, 13); // April 13, 2026
const PROGRAM_END = new Date(2026, 6, 5); // July 5, 2026

type WorkoutType = "push-a" | "pull-a" | "legs-a" | "push-b" | "pull-b" | "legs-b" | "rest";

const DOW_TO_WORKOUT: Record<number, WorkoutType> = {
  0: "rest",
  1: "push-a",
  2: "pull-a",
  3: "legs-a",
  4: "push-b",
  5: "pull-b",
  6: "legs-b",
};

const WORKOUT_LABEL: Record<WorkoutType, { title: string; subtitle: string; color: string }> = {
  "push-a": { title: "Push A", subtitle: "Heavy Strength", color: "text-orange-400" },
  "push-b": { title: "Push B", subtitle: "Hypertrophy", color: "text-orange-300" },
  "pull-a": { title: "Pull A", subtitle: "Heavy Strength", color: "text-blue-400" },
  "pull-b": { title: "Pull B", subtitle: "Hypertrophy", color: "text-blue-300" },
  "legs-a": { title: "Legs A", subtitle: "Heavy Strength", color: "text-green-400" },
  "legs-b": { title: "Legs B", subtitle: "Hypertrophy", color: "text-green-300" },
  rest: { title: "Rest Day", subtitle: "Active Recovery", color: "text-muted-foreground" },
};

// Phase info
const PHASES = [
  { name: "Phase 1: Ignition", weeks: "1-4", calories: "1,900 cal", focus: "Build habits, learn lifts, initial fat loss" },
  { name: "Phase 2: Accelerate", weeks: "5-8", calories: "1,800 cal", focus: "Increase intensity, add supersets" },
  { name: "Phase 3: Shred", weeks: "9-12", calories: "1,750 cal", focus: "Peak intensity, carb cycling, max definition" },
];

// Expected progress
const EXPECTED_PROGRESS = [
  { weeks: "1-2", weight: "196-198 lbs", bf: "~30%", notice: "Water weight drops fast" },
  { weeks: "3-4", weight: "192-194 lbs", bf: "~28%", notice: "Clothes fit looser" },
  { weeks: "5-6", weight: "188-190 lbs", bf: "~26%", notice: "Face leaning out, arms showing definition" },
  { weeks: "7-8", weight: "182-185 lbs", bf: "~24%", notice: "Visible abs outline, shoulders popping" },
  { weeks: "9-10", weight: "176-180 lbs", bf: "~22%", notice: "Veins appearing, V-taper forming" },
  { weeks: "11-12", weight: "170-175 lbs", bf: "~20%", notice: "Shredded look emerging" },
];

// Supplement stack
const SUPPLEMENTS = [
  { name: "Creatine Monohydrate", dose: "5g", timing: "Daily (any time)" },
  { name: "Whey Protein Isolate", dose: "1-2 scoops", timing: "Post-workout + snack" },
  { name: "Casein Protein", dose: "1 scoop", timing: "Before bed" },
  { name: "Pre-Workout / Caffeine", dose: "200-300mg", timing: "30 min pre-workout" },
  { name: "Fish Oil (Omega-3)", dose: "2-3g", timing: "With meals" },
  { name: "Vitamin D3", dose: "2000-5000 IU", timing: "Morning with food" },
  { name: "Magnesium Glycinate", dose: "200-400mg", timing: "Before bed" },
  { name: "Electrolytes", dose: "1 packet", timing: "During workout" },
];

// Non-negotiable rules
const RULES = [
  { icon: Target, label: "Track Everything", desc: "MyFitnessPal + kitchen scale" },
  { icon: Footprints, label: "10,000 Steps Daily", desc: "Your secret fat-burning weapon (NEAT)" },
  { icon: Moon, label: "Sleep 7-8 Hours", desc: "Growth hormone peaks during deep sleep" },
  { icon: Droplets, label: "1 Gallon Water Daily", desc: "128 oz minimum + electrolytes" },
  { icon: TrendingDown, label: "Progressive Overload", desc: "Add weight or reps every week" },
  { icon: Flame, label: "No Liquid Calories", desc: "Black coffee, water, diet drinks only" },
];

function getCurrentPhase(weekNum: number) {
  if (weekNum <= 4) return 0;
  if (weekNum <= 8) return 1;
  return 2;
}

export default function Dashboard() {
  const { data: logs = [] } = useQuery<WorkoutLog[]>({ queryKey: ["/api/workout-logs"] });
  const { data: prs = [] } = useQuery<PersonalRecord[]>({ queryKey: ["/api/personal-records"] });
  const { data: exercises = [] } = useQuery<Exercise[]>({ queryKey: ["/api/exercises"] });

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const todayLogs = logs.filter((l) => l.date === todayStr);
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

  // Program week
  const inProgram = isWithinInterval(today, { start: PROGRAM_START, end: PROGRAM_END });
  const weekNum = inProgram ? differenceInCalendarWeeks(today, PROGRAM_START, { weekStartsOn: 1 }) + 1 : null;
  const phaseIdx = weekNum ? getCurrentPhase(weekNum) : null;
  const todayWorkout = inProgram ? DOW_TO_WORKOUT[today.getDay()] : null;
  const workoutInfo = todayWorkout ? WORKOUT_LABEL[todayWorkout] : null;

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

      {/* Today's Workout Card */}
      {inProgram && workoutInfo && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="pt-5 pb-4 px-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Today's Workout — {format(today, "EEEE, MMM d")}
                </p>
                <h2 className={`text-xl font-bold ${workoutInfo.color}`}>
                  {workoutInfo.title}
                </h2>
                <p className="text-sm text-muted-foreground">{workoutInfo.subtitle}</p>
              </div>
              <div className="text-right">
                {weekNum && (
                  <Badge variant="outline" className="text-xs bg-primary/10 border-primary/30 text-primary mb-1">
                    Week {weekNum} of 12
                  </Badge>
                )}
                {phaseIdx !== null && (
                  <p className="text-[11px] text-muted-foreground mt-1">{PHASES[phaseIdx].name}</p>
                )}
              </div>
            </div>

            {/* Warm-up / Cool-down reminders */}
            {todayWorkout !== "rest" && (
              <div className="mt-4 pt-3 border-t border-border/50 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                  <Timer className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span><span className="font-semibold text-foreground">Warm-up:</span> 5 min incline walk + dynamic stretches</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                  <Dumbbell className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span><span className="font-semibold text-foreground">Before heavy sets:</span> 2-3 warm-up sets (bar→50%→75%)</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                  <Bike className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span><span className="font-semibold text-foreground">Post-workout:</span> 15-20 min LISS cardio (incline walk/bike)</span>
                </div>
              </div>
            )}

            {todayWorkout === "rest" && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Active recovery: walk, stretch, foam roll. Sleep 8+ hours, stay hydrated, eat clean.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

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

      {/* Program Phases */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">12-Week Program Phases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-3">
            {PHASES.map((phase, i) => {
              const isCurrentPhase = phaseIdx === i;
              return (
                <div
                  key={i}
                  className={`rounded-lg px-4 py-3 border ${
                    isCurrentPhase
                      ? "border-primary/40 bg-primary/10"
                      : "border-border/50 bg-muted/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`text-sm font-semibold ${isCurrentPhase ? "text-primary" : "text-foreground"}`}>
                      {phase.name}
                    </p>
                    {isCurrentPhase && (
                      <Badge className="text-[9px] bg-primary/20 text-primary border-primary/30 border px-1.5 py-0">
                        NOW
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Weeks {phase.weeks} · {phase.calories}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{phase.focus}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Expected Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Expected Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0 divide-y divide-border">
            {EXPECTED_PROGRESS.map((row, i) => {
              const isCurrentRange = weekNum
                ? (() => {
                    const [start, end] = row.weeks.split("-").map(Number);
                    return weekNum >= start && weekNum <= end;
                  })()
                : false;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between py-2.5 first:pt-0 last:pb-0 ${
                    isCurrentRange ? "bg-primary/5 -mx-2 px-2 rounded-lg" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isCurrentRange && <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0" />}
                    <div>
                      <p className={`text-sm font-medium ${isCurrentRange ? "text-primary" : ""}`}>
                        Week {row.weeks}
                      </p>
                      <p className="text-xs text-muted-foreground">{row.notice}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-mono tabular-nums">{row.weight}</p>
                    <p className="text-[10px] text-muted-foreground">{row.bf} BF</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Session Protocol */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Every Session Protocol</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-yellow-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <Timer className="w-3.5 h-3.5 text-yellow-400" />
              </div>
              <div>
                <p className="font-semibold">Pre-Workout Warm-Up</p>
                <p className="text-xs text-muted-foreground">5 min incline treadmill walk + dynamic stretches (arm circles, leg swings, hip openers)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Dumbbell className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Warm-Up Sets (Before Heavy Compound)</p>
                <p className="text-xs text-muted-foreground">Empty bar × 15 reps → 50% weight × 10 reps → 75% weight × 5 reps. Primes nervous system, prevents injury.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-red-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <Flame className="w-3.5 h-3.5 text-red-400" />
              </div>
              <div>
                <p className="font-semibold">Working Sets</p>
                <p className="text-xs text-muted-foreground">Heavy compounds: 2-3 min rest. Isolation: 45-90 sec rest. Focus on mind-muscle connection, controlled negatives.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-green-500/15 flex items-center justify-center shrink-0 mt-0.5">
                <Bike className="w-3.5 h-3.5 text-green-400" />
              </div>
              <div>
                <p className="font-semibold">Post-Workout LISS Cardio</p>
                <p className="text-xs text-muted-foreground">15-20 min incline treadmill walk or stationary bike. Maximizes fat burning while preserving muscle. Keep heart rate 120-140 BPM.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Supplement Stack */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Pill className="w-4 h-4 text-primary" />
              <CardTitle className="text-sm font-semibold">Supplement Stack</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-0 divide-y divide-border">
              {SUPPLEMENTS.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.timing}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono shrink-0 ml-3">
                    {s.dose}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Non-Negotiable Rules */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Non-Negotiable Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {RULES.map((rule, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <rule.icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{rule.label}</p>
                    <p className="text-xs text-muted-foreground">{rule.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Your Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Your Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Height", value: "5'5\"" },
              { label: "Starting Weight", value: "200 lbs" },
              { label: "Target Weight", value: "160 lbs" },
              { label: "Daily Calories", value: phaseIdx !== null ? PHASES[phaseIdx].calories : "1,800-1,900" },
              { label: "Protein Target", value: "190g/day" },
              { label: "Training Split", value: "PPL × 2" },
              { label: "Deload", value: "Every 4th week" },
              { label: "Refeed", value: "Every 2 weeks" },
            ].map((item, i) => (
              <div key={i} className="bg-muted/30 rounded-lg px-3 py-2.5">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-semibold mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Training Tips */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Training Principles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { title: "Mind-Muscle Connection", desc: "Feel the target muscle. A controlled 50 lb curl > a swinging 70 lb curl." },
              { title: "Form Over Ego", desc: "At 5'5\" and 200 lbs, your joints are under load. Perfect form protects you." },
              { title: "Deload Every 4th Week", desc: "Drop weights 40%, same exercises, perfect form. Prevents injury." },
              { title: "Weekly Check-Ins", desc: "Weigh every morning (post-bathroom). Use weekly average, not daily." },
            ].map((tip, i) => (
              <div key={i} className="bg-muted/20 rounded-lg px-3 py-2.5 border border-border/40">
                <p className="text-sm font-semibold mb-0.5">{tip.title}</p>
                <p className="text-xs text-muted-foreground">{tip.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
