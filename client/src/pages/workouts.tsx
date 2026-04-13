import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Plus, Trophy, ChevronDown, Timer, Bike, Dumbbell as DumbbellIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Exercise, WorkoutLog } from "@shared/schema";

type WorkoutExercise = {
  name: string;
  sets: string;
  reps: string;
  notes?: string;
};

type WorkoutDay = {
  day: string;
  title: string;
  subtitle: string;
  exercises: WorkoutExercise[];
};

const PPL_PROGRAM: WorkoutDay[] = [
  {
    day: "Monday",
    title: "Push A",
    subtitle: "Heavy Strength",
    exercises: [
      { name: "Barbell Bench Press", sets: "4", reps: "5-6", notes: "Heavy compound" },
      { name: "Incline Dumbbell Press", sets: "3", reps: "8-10" },
      { name: "Overhead Press", sets: "4", reps: "6-8" },
      { name: "Cable Lateral Raise", sets: "3", reps: "12-15" },
      { name: "Dips", sets: "3", reps: "8-12", notes: "Weighted if possible" },
      { name: "Tricep Pushdown", sets: "3", reps: "10-12" },
      { name: "Overhead Tricep Extension", sets: "2", reps: "12-15" },
    ],
  },
  {
    day: "Tuesday",
    title: "Pull A",
    subtitle: "Heavy Strength",
    exercises: [
      { name: "Deadlift", sets: "4", reps: "5-6", notes: "Heavy compound" },
      { name: "Pull-Ups", sets: "4", reps: "6-10", notes: "Weighted if possible" },
      { name: "Barbell Bent-Over Row", sets: "3", reps: "8-10" },
      { name: "Seated Cable Row", sets: "3", reps: "10-12" },
      { name: "Face Pulls", sets: "3", reps: "15-20" },
      { name: "Barbell Curl", sets: "3", reps: "8-10" },
      { name: "Hammer Curl", sets: "2", reps: "10-12" },
    ],
  },
  {
    day: "Wednesday",
    title: "Legs A",
    subtitle: "Heavy Strength",
    exercises: [
      { name: "Barbell Squat", sets: "4", reps: "5-6", notes: "Heavy compound" },
      { name: "Romanian Deadlift", sets: "3", reps: "8-10" },
      { name: "Leg Press", sets: "3", reps: "10-12" },
      { name: "Walking Lunges", sets: "3", reps: "12 each" },
      { name: "Lying Leg Curl", sets: "3", reps: "10-12" },
      { name: "Standing Calf Raise", sets: "4", reps: "12-15" },
      { name: "Hanging Leg Raise", sets: "3", reps: "12-15" },
    ],
  },
  {
    day: "Thursday",
    title: "Push B",
    subtitle: "Hypertrophy",
    exercises: [
      { name: "Dumbbell Bench Press", sets: "4", reps: "8-12" },
      { name: "Cable Fly", sets: "3", reps: "12-15" },
      { name: "Arnold Press", sets: "3", reps: "10-12" },
      { name: "Lateral Raise Drop Set", sets: "3", reps: "10/10/10" },
      { name: "Close-Grip Bench Press", sets: "3", reps: "8-12" },
      { name: "Skull Crushers", sets: "3", reps: "10-12" },
      { name: "Push-Ups", sets: "2", reps: "To failure" },
    ],
  },
  {
    day: "Friday",
    title: "Pull B",
    subtitle: "Hypertrophy",
    exercises: [
      { name: "Lat Pulldown", sets: "4", reps: "10-12" },
      { name: "T-Bar Row", sets: "3", reps: "8-10" },
      { name: "Single-Arm Dumbbell Row", sets: "3", reps: "10-12 each" },
      { name: "Straight-Arm Pulldown", sets: "3", reps: "12-15" },
      { name: "Reverse Fly", sets: "3", reps: "12-15" },
      { name: "Incline Dumbbell Curl", sets: "3", reps: "10-12" },
      { name: "Concentration Curl", sets: "2", reps: "12-15" },
    ],
  },
  {
    day: "Saturday",
    title: "Legs B",
    subtitle: "Hypertrophy",
    exercises: [
      { name: "Front Squat", sets: "4", reps: "8-10" },
      { name: "Bulgarian Split Squat", sets: "3", reps: "10-12 each" },
      { name: "Hack Squat", sets: "3", reps: "10-12" },
      { name: "Leg Extension", sets: "3", reps: "12-15" },
      { name: "Nordic Curl", sets: "3", reps: "6-10" },
      { name: "Seated Calf Raise", sets: "4", reps: "15-20" },
      { name: "Cable Crunch + Plank", sets: "3", reps: "15 + 30s" },
    ],
  },
];

const categoryColor: Record<string, string> = {
  "Heavy Strength": "bg-red-500/15 text-red-400 border-red-500/20",
  Hypertrophy: "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

// ─── Inline Log Section ────────────────────────────────────────────────────

function WorkoutLogSection({ workout }: { workout: WorkoutDay }) {
  const { toast } = useToast();
  const today = format(new Date(), "yyyy-MM-dd");

  const [open, setOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  // All exercises from DB
  const { data: allExercises = [] } = useQuery<Exercise[]>({
    queryKey: ["/api/exercises"],
  });

  // Filter to only exercises in this workout day, matched by name
  const dayExerciseNames = new Set(workout.exercises.map((e) => e.name));
  const dayExercises = allExercises.filter((e) => dayExerciseNames.has(e.name));

  // Today's logs for any exercise in this workout
  const { data: todayLogs = [] } = useQuery<WorkoutLog[]>({
    queryKey: ["/api/workout-logs/date", today],
    enabled: open,
  });

  // Filter logs to only exercises in this workout
  const dayExerciseIds = new Set(dayExercises.map((e) => e.id));
  const workoutLogs = todayLogs.filter((l) => dayExerciseIds.has(l.exerciseId));
  const exerciseMap = Object.fromEntries(allExercises.map((e) => [e.id, e.name]));

  const totalVolume = workoutLogs.reduce((sum, l) => sum + l.weight * l.reps * l.sets, 0);

  const logMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/workout-logs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-logs/date", today] });
      setWeight("");
      setNotes("");
      toast({ title: "Set logged", description: "Keep pushing." });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/workout-logs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-logs/date", today] });
    },
  });

  const prMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/personal-records", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-records"] });
      toast({ title: "PR Saved!", description: "New personal record recorded." });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise || !weight) return;
    logMutation.mutate({
      exerciseId: Number(selectedExercise),
      date: today,
      sets: Number(sets),
      reps: Number(reps),
      weight: Number(weight),
      notes: notes || null,
    });
  };

  const handleSavePR = (log: WorkoutLog) => {
    prMutation.mutate({
      exerciseId: log.exerciseId,
      weight: log.weight,
      reps: log.reps,
      date: log.date,
    });
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-4">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between px-3 py-2 h-auto text-sm font-medium text-muted-foreground hover:text-foreground border border-border/60 rounded-lg hover:bg-muted/30"
          data-testid={`button-log-toggle-${workout.day.toLowerCase()}`}
        >
          <span className="flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" />
            Log Your Workout
            {workoutLogs.length > 0 && (
              <Badge
                variant="secondary"
                className="text-[10px] px-1.5 py-0.5 leading-none"
              >
                {workoutLogs.length} {workoutLogs.length === 1 ? "set" : "sets"}
              </Badge>
            )}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="mt-3 space-y-4">
        {/* Log Form */}
        <Card className="border-border/60">
          <CardHeader className="pb-3 pt-4 px-4">
            <CardTitle className="text-sm font-semibold">New Set</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <Label className="text-xs mb-1.5 block">Exercise</Label>
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger data-testid={`select-exercise-${workout.day.toLowerCase()}`}>
                    <SelectValue placeholder="Pick exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {dayExercises.length > 0 ? (
                      dayExercises.map((ex) => (
                        <SelectItem key={ex.id} value={String(ex.id)}>
                          {ex.name}
                        </SelectItem>
                      ))
                    ) : (
                      // Fallback: show all exercises grouped if day exercises not matched
                      allExercises.map((ex) => (
                        <SelectItem key={ex.id} value={String(ex.id)}>
                          {ex.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs mb-1.5 block">Sets</Label>
                  <Input
                    type="number"
                    min={1}
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    data-testid={`input-sets-${workout.day.toLowerCase()}`}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Reps</Label>
                  <Input
                    type="number"
                    min={1}
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    data-testid={`input-reps-${workout.day.toLowerCase()}`}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Weight (lbs)</Label>
                  <Input
                    type="number"
                    min={0}
                    step={2.5}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="135"
                    data-testid={`input-weight-${workout.day.toLowerCase()}`}
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Notes (optional)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. felt easy, add weight"
                  data-testid={`input-notes-${workout.day.toLowerCase()}`}
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={logMutation.isPending || !selectedExercise || !weight}
                data-testid={`button-log-set-${workout.day.toLowerCase()}`}
              >
                <Plus className="w-4 h-4 mr-2" />
                {logMutation.isPending ? "Logging..." : "Log Set"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Today's logs for this workout */}
        {workoutLogs.length > 0 && (
          <Card className="border-border/60">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">
                  Today's Sets — {format(new Date(), "MMM d")}
                </CardTitle>
                {totalVolume > 0 && (
                  <Badge variant="secondary" className="font-mono text-xs tabular-nums">
                    {totalVolume.toLocaleString()} lbs
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="space-y-2">
                {workoutLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50 group"
                    data-testid={`log-entry-${log.id}`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {exerciseMap[log.exerciseId] || "Unknown"}
                      </p>
                      {log.notes && (
                        <p className="text-xs text-muted-foreground">{log.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      <span className="text-sm font-mono tabular-nums text-foreground">
                        {log.sets}×{log.reps} @ {log.weight} lbs
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={() => handleSavePR(log)}
                        data-testid={`button-save-pr-${log.id}`}
                        title="Save as PR"
                      >
                        <Trophy className="w-3.5 h-3.5 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={() => deleteMutation.mutate(log.id)}
                        data-testid={`button-delete-${log.id}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Main Workouts Page ────────────────────────────────────────────────────

export default function Workouts() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight" data-testid="text-page-title">
          Workout Program
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          6-Day Push / Pull / Legs Split
        </p>
      </div>

      <Tabs defaultValue="Monday">
        <TabsList className="w-full justify-start overflow-x-auto">
          {PPL_PROGRAM.map((w) => (
            <TabsTrigger
              key={w.day}
              value={w.day}
              data-testid={`tab-${w.day.toLowerCase()}`}
              className="text-xs"
            >
              {w.day.slice(0, 3)}
            </TabsTrigger>
          ))}
          <TabsTrigger value="Sunday" data-testid="tab-sunday" className="text-xs">
            Sun
          </TabsTrigger>
        </TabsList>

        {PPL_PROGRAM.map((workout) => (
          <TabsContent key={workout.day} value={workout.day} className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-base font-semibold">{workout.title}</CardTitle>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${categoryColor[workout.subtitle] || ""}`}
                  >
                    {workout.subtitle}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Pre-workout reminder */}
                <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                  <Timer className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span><span className="font-semibold text-yellow-400">Warm-up:</span> 5 min incline treadmill walk + dynamic stretches. Then 2-3 warm-up sets before first heavy lift (bar×15 → 50%×10 → 75%×5)</span>
                </div>

                <div className="space-y-0 divide-y divide-border">
                  {workout.exercises.map((ex, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                      data-testid={`exercise-row-${i}`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ex.name}</p>
                        {ex.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5">{ex.notes}</p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-sm font-mono tabular-nums text-muted-foreground">
                          {ex.sets} × {ex.reps}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Post-workout reminder */}
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                  <Bike className="w-3.5 h-3.5 text-green-400 shrink-0" />
                  <span><span className="font-semibold text-green-400">Post-workout:</span> 15-20 min LISS cardio (incline walk or stationary bike) to maximize fat burning. Keep HR 120-140 BPM.</span>
                </div>

                {/* Inline log section */}
                <WorkoutLogSection workout={workout} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="Sunday" className="mt-4">
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-2xl">😤</span>
                </div>
                <h3 className="text-lg font-semibold mb-1">Rest Day</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Recovery is part of the process. Sleep 8+ hours, stay hydrated, eat clean. Come back stronger tomorrow.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
