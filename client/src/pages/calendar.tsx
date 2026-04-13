import { useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
  differenceInCalendarWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Program bounds
const PROGRAM_START = new Date(2026, 3, 13); // April 13, 2026 (Monday)
const PROGRAM_END = new Date(2026, 6, 5);   // July 5, 2026 (Sunday)

// PPL schedule by day-of-week (0=Sun, 1=Mon, ..., 6=Sat)
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

const WORKOUT_META: Record<WorkoutType, { label: string; subtitle: string; color: string; bg: string; dot: string }> = {
  "push-a": {
    label: "Push A",
    subtitle: "Heavy Strength",
    color: "text-orange-400",
    bg: "bg-orange-500/20 border border-orange-500/30",
    dot: "bg-orange-500",
  },
  "push-b": {
    label: "Push B",
    subtitle: "Hypertrophy",
    color: "text-orange-300",
    bg: "bg-orange-500/15 border border-orange-400/25",
    dot: "bg-orange-400",
  },
  "pull-a": {
    label: "Pull A",
    subtitle: "Heavy Strength",
    color: "text-blue-400",
    bg: "bg-blue-500/20 border border-blue-500/30",
    dot: "bg-blue-500",
  },
  "pull-b": {
    label: "Pull B",
    subtitle: "Hypertrophy",
    color: "text-blue-300",
    bg: "bg-blue-500/15 border border-blue-400/25",
    dot: "bg-blue-400",
  },
  "legs-a": {
    label: "Legs A",
    subtitle: "Heavy Strength",
    color: "text-green-400",
    bg: "bg-green-500/20 border border-green-500/30",
    dot: "bg-green-500",
  },
  "legs-b": {
    label: "Legs B",
    subtitle: "Hypertrophy",
    color: "text-green-300",
    bg: "bg-green-500/15 border border-green-400/25",
    dot: "bg-green-400",
  },
  rest: {
    label: "Rest Day",
    subtitle: "Recovery",
    color: "text-muted-foreground",
    bg: "bg-muted/40 border border-border/50",
    dot: "bg-muted-foreground/40",
  },
};

const PPL_EXERCISES: Record<WorkoutType, string[]> = {
  "push-a": [
    "Barbell Bench Press",
    "Incline Dumbbell Press",
    "Overhead Press",
    "Cable Lateral Raise",
    "Dips",
    "Tricep Pushdown",
    "Overhead Tricep Extension",
  ],
  "pull-a": [
    "Deadlift",
    "Pull-Ups",
    "Barbell Bent-Over Row",
    "Seated Cable Row",
    "Face Pulls",
    "Barbell Curl",
    "Hammer Curl",
  ],
  "legs-a": [
    "Barbell Squat",
    "Romanian Deadlift",
    "Leg Press",
    "Walking Lunges",
    "Lying Leg Curl",
    "Standing Calf Raise",
    "Hanging Leg Raise",
  ],
  "push-b": [
    "Dumbbell Bench Press",
    "Cable Fly",
    "Arnold Press",
    "Lateral Raise Drop Set",
    "Close-Grip Bench Press",
    "Skull Crushers",
    "Push-Ups",
  ],
  "pull-b": [
    "Lat Pulldown",
    "T-Bar Row",
    "Single-Arm Dumbbell Row",
    "Straight-Arm Pulldown",
    "Reverse Fly",
    "Incline Dumbbell Curl",
    "Concentration Curl",
  ],
  "legs-b": [
    "Front Squat",
    "Bulgarian Split Squat",
    "Hack Squat",
    "Leg Extension",
    "Nordic Curl",
    "Seated Calf Raise",
    "Cable Crunch + Plank",
  ],
  rest: [],
};

function getWorkoutForDate(date: Date): WorkoutType | null {
  if (!isWithinInterval(date, { start: PROGRAM_START, end: PROGRAM_END })) {
    return null;
  }
  const dow = date.getDay();
  return DOW_TO_WORKOUT[dow];
}

function getWeekNumber(date: Date): number {
  return differenceInCalendarWeeks(date, PROGRAM_START, { weekStartsOn: 1 }) + 1;
}

// Initial month to show: April 2026
const INITIAL_MONTH = new Date(2026, 3, 1);

export default function Calendar() {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(INITIAL_MONTH);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Clamp navigation to Apr–Jul 2026
  const canGoPrev = currentMonth.getFullYear() > 2026 || currentMonth.getMonth() > 3;
  const canGoNext = currentMonth.getFullYear() < 2026 || currentMonth.getMonth() < 6;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  // Week headers
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Selected day info
  const selectedWorkout = selectedDay ? getWorkoutForDate(selectedDay) : null;
  const selectedMeta = selectedWorkout ? WORKOUT_META[selectedWorkout] : null;
  const selectedWeek =
    selectedDay && isWithinInterval(selectedDay, { start: PROGRAM_START, end: PROGRAM_END })
      ? getWeekNumber(selectedDay)
      : null;

  // Current program week (for today if in range)
  const todayInProgram =
    isWithinInterval(today, { start: PROGRAM_START, end: PROGRAM_END });
  const currentProgramWeek = todayInProgram ? getWeekNumber(today) : null;
  const todayWorkout = todayInProgram ? getWorkoutForDate(today) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight" data-testid="text-page-title">
            Program Calendar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            12-Week PPL · Apr 13 – Jul 5, 2026
          </p>
        </div>
        {currentProgramWeek && (
          <Badge
            variant="outline"
            className="self-start sm:self-auto text-xs bg-primary/10 border-primary/30 text-primary px-3 py-1.5"
          >
            <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
            Week {currentProgramWeek} of 12
          </Badge>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {(["push-a", "pull-a", "legs-a", "push-b", "pull-b", "legs-b", "rest"] as WorkoutType[]).map((wt) => {
          const m = WORKOUT_META[wt];
          return (
            <div key={wt} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${m.dot}`} />
              {m.label}
            </div>
          );
        })}
      </div>

      {/* Calendar Card */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              disabled={!canGoPrev}
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-base font-semibold tracking-tight">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              disabled={!canGoNext}
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {weekDays.map((d) => (
              <div
                key={d}
                className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wide py-1"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
            {calDays.map((day) => {
              const inMonth = isSameMonth(day, currentMonth);
              const workout = getWorkoutForDate(day);
              const inProgram = isWithinInterval(day, { start: PROGRAM_START, end: PROGRAM_END });
              const isToday = isSameDay(day, today);
              const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
              const meta = workout ? WORKOUT_META[workout] : null;

              let cellClass =
                "relative flex flex-col items-center justify-start pt-1.5 pb-1 px-0.5 rounded-lg cursor-pointer transition-all min-h-[52px] sm:min-h-[60px] ";

              if (!inMonth) {
                cellClass += "opacity-0 pointer-events-none ";
              } else if (isSelected) {
                cellClass += "ring-2 ring-primary ";
                if (meta && inProgram) {
                  cellClass += meta.bg + " ";
                } else {
                  cellClass += "bg-muted/30 border border-border/40 ";
                }
              } else if (inProgram && meta) {
                cellClass += meta.bg + " hover:opacity-80 ";
              } else {
                cellClass += "bg-muted/10 border border-transparent hover:bg-muted/20 ";
              }

              return (
                <div
                  key={day.toISOString()}
                  className={cellClass}
                  onClick={() => inMonth && setSelectedDay(isSelected ? null : day)}
                  role="button"
                  aria-label={format(day, "MMMM d, yyyy")}
                >
                  {/* TODAY pill */}
                  {isToday && inMonth ? (
                    <span className="text-[11px] font-bold leading-none bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center mb-0.5">
                      {format(day, "d")}
                    </span>
                  ) : (
                    <span
                      className={`text-[12px] font-medium leading-none mb-0.5 ${
                        inProgram && meta && meta.color !== "text-muted-foreground"
                          ? meta.color
                          : inMonth
                          ? "text-foreground/70"
                          : "text-muted-foreground/40"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  )}
                  {/* Workout dot / label */}
                  {inProgram && meta && (
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 mt-0.5 ${meta.dot}`} />
                  )}
                  {/* Compact label on larger screens */}
                  {inProgram && meta && workout !== "rest" && (
                    <span
                      className={`hidden sm:block text-[9px] font-semibold mt-0.5 leading-none ${meta.color}`}
                    >
                      {meta.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected Day Detail */}
      {selectedDay && (
        <Card className="animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-semibold">
                    {format(selectedDay, "EEEE, MMMM d, yyyy")}
                  </h3>
                  {isSameDay(selectedDay, today) && (
                    <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30 border">
                      TODAY
                    </Badge>
                  )}
                  {selectedWeek && (
                    <Badge variant="outline" className="text-[10px]">
                      Week {selectedWeek} of 12
                    </Badge>
                  )}
                </div>
                {selectedMeta && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${selectedMeta.dot}`} />
                    <span className={`text-sm font-medium ${selectedMeta.color}`}>
                      {selectedMeta.label}
                    </span>
                    <span className="text-xs text-muted-foreground">· {selectedMeta.subtitle}</span>
                  </div>
                )}
                {!selectedWorkout && (
                  <p className="text-sm text-muted-foreground mt-1">Outside program window</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground shrink-0"
                onClick={() => setSelectedDay(null)}
              >
                Close
              </Button>
            </div>

            {selectedWorkout && selectedWorkout !== "rest" && PPL_EXERCISES[selectedWorkout].length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Exercise List
                </p>
                <div className="grid sm:grid-cols-2 gap-1.5">
                  {PPL_EXERCISES[selectedWorkout].map((ex, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm py-1.5 px-2.5 rounded-md bg-muted/30"
                    >
                      <span className="text-muted-foreground text-xs tabular-nums w-4 shrink-0">
                        {i + 1}.
                      </span>
                      <span className="font-medium truncate">{ex}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedWorkout === "rest" && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Rest day — recovery is part of the process. Sleep 8+ hours, stay hydrated.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Today's workout summary (if in program and no day selected) */}
      {!selectedDay && todayInProgram && todayWorkout && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2 h-2 rounded-full ${WORKOUT_META[todayWorkout].dot}`} />
              <p className="text-sm font-semibold text-primary">Today's Workout</p>
            </div>
            <p className={`text-base font-bold ${WORKOUT_META[todayWorkout].color}`}>
              {WORKOUT_META[todayWorkout].label}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {WORKOUT_META[todayWorkout].subtitle} · Week {currentProgramWeek} of 12
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
