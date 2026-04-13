import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Exercise, WorkoutLog } from "@shared/schema";

export default function LogWorkout() {
  const { toast } = useToast();
  const today = format(new Date(), "yyyy-MM-dd");

  const [selectedExercise, setSelectedExercise] = useState("");
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");

  const { data: exercises = [] } = useQuery<Exercise[]>({ queryKey: ["/api/exercises"] });
  const { data: todayLogs = [] } = useQuery<WorkoutLog[]>({
    queryKey: ["/api/workout-logs/date", date],
  });

  const logMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/workout-logs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workout-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workout-logs/date", date] });
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
      queryClient.invalidateQueries({ queryKey: ["/api/workout-logs/date", date] });
    },
  });

  const prMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/personal-records", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal-records"] });
      toast({
        title: "PR Saved!",
        description: "New personal record recorded.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise || !weight) return;
    logMutation.mutate({
      exerciseId: Number(selectedExercise),
      date,
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

  const exerciseMap = Object.fromEntries(exercises.map((e) => [e.id, e.name]));

  // Group exercises by category
  const grouped = exercises.reduce<Record<string, Exercise[]>>((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = [];
    acc[ex.category].push(ex);
    return acc;
  }, {});

  const totalVolume = todayLogs.reduce((sum, l) => sum + l.weight * l.reps * l.sets, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight" data-testid="text-page-title">
          Log Workout
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record your sets, reps, and weight
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Log Form */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">New Set</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs mb-1.5 block">Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  data-testid="input-date"
                />
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Exercise</Label>
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger data-testid="select-exercise">
                    <SelectValue placeholder="Pick exercise" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(grouped).map(([cat, exs]) => (
                      <div key={cat}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {cat}
                        </div>
                        {exs.map((ex) => (
                          <SelectItem key={ex.id} value={String(ex.id)}>
                            {ex.name}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs mb-1.5 block">Sets</Label>
                  <Input
                    type="number"
                    min={1}
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    data-testid="input-sets"
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block">Reps</Label>
                  <Input
                    type="number"
                    min={1}
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    data-testid="input-reps"
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
                    data-testid="input-weight"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs mb-1.5 block">Notes (optional)</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. felt easy, add weight"
                  data-testid="input-notes"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={logMutation.isPending || !selectedExercise || !weight}
                data-testid="button-log-set"
              >
                <Plus className="w-4 h-4 mr-2" />
                {logMutation.isPending ? "Logging..." : "Log Set"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Today's Log */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">
                Session — {format(new Date(date + "T12:00:00"), "MMM d, yyyy")}
              </CardTitle>
              {totalVolume > 0 && (
                <Badge variant="secondary" className="font-mono text-xs tabular-nums">
                  {totalVolume.toLocaleString()} lbs
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {todayLogs.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <Trash2 className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No sets logged for this date yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {todayLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/50 group"
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
                    <div className="flex items-center gap-2 shrink-0 ml-3">
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
