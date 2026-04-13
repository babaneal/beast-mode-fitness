import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
