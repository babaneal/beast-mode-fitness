import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, db } from "./storage";
import { exercises, workoutLogs, personalRecords, insertWorkoutLogSchema, insertPersonalRecordSchema } from "@shared/schema";
import { sql } from "drizzle-orm";

// Seed exercises on startup
function seedExercises() {
  const existing = db.select().from(exercises).all();
  if (existing.length > 0) return;

  const exerciseData = [
    // Push exercises
    { name: "Barbell Bench Press", muscleGroup: "chest", category: "push" },
    { name: "Incline Dumbbell Press", muscleGroup: "chest", category: "push" },
    { name: "Overhead Press", muscleGroup: "shoulders", category: "push" },
    { name: "Cable Lateral Raise", muscleGroup: "shoulders", category: "push" },
    { name: "Dips", muscleGroup: "triceps", category: "push" },
    { name: "Tricep Pushdown", muscleGroup: "triceps", category: "push" },
    { name: "Overhead Tricep Extension", muscleGroup: "triceps", category: "push" },
    { name: "Dumbbell Bench Press", muscleGroup: "chest", category: "push" },
    { name: "Cable Fly", muscleGroup: "chest", category: "push" },
    { name: "Arnold Press", muscleGroup: "shoulders", category: "push" },
    { name: "Lateral Raise Drop Set", muscleGroup: "shoulders", category: "push" },
    { name: "Close-Grip Bench Press", muscleGroup: "triceps", category: "push" },
    { name: "Skull Crushers", muscleGroup: "triceps", category: "push" },
    { name: "Push-Ups", muscleGroup: "chest", category: "push" },

    // Pull exercises
    { name: "Deadlift", muscleGroup: "back", category: "pull" },
    { name: "Pull-Ups", muscleGroup: "back", category: "pull" },
    { name: "Barbell Bent-Over Row", muscleGroup: "back", category: "pull" },
    { name: "Seated Cable Row", muscleGroup: "back", category: "pull" },
    { name: "Face Pulls", muscleGroup: "shoulders", category: "pull" },
    { name: "Barbell Curl", muscleGroup: "biceps", category: "pull" },
    { name: "Hammer Curl", muscleGroup: "biceps", category: "pull" },
    { name: "Lat Pulldown", muscleGroup: "back", category: "pull" },
    { name: "T-Bar Row", muscleGroup: "back", category: "pull" },
    { name: "Single-Arm Dumbbell Row", muscleGroup: "back", category: "pull" },
    { name: "Straight-Arm Pulldown", muscleGroup: "back", category: "pull" },
    { name: "Reverse Fly", muscleGroup: "shoulders", category: "pull" },
    { name: "Incline Dumbbell Curl", muscleGroup: "biceps", category: "pull" },
    { name: "Concentration Curl", muscleGroup: "biceps", category: "pull" },

    // Legs exercises
    { name: "Barbell Squat", muscleGroup: "quads", category: "legs" },
    { name: "Romanian Deadlift", muscleGroup: "hamstrings", category: "legs" },
    { name: "Leg Press", muscleGroup: "quads", category: "legs" },
    { name: "Walking Lunges", muscleGroup: "quads", category: "legs" },
    { name: "Lying Leg Curl", muscleGroup: "hamstrings", category: "legs" },
    { name: "Standing Calf Raise", muscleGroup: "calves", category: "legs" },
    { name: "Hanging Leg Raise", muscleGroup: "abs", category: "legs" },
    { name: "Front Squat", muscleGroup: "quads", category: "legs" },
    { name: "Bulgarian Split Squat", muscleGroup: "quads", category: "legs" },
    { name: "Hack Squat", muscleGroup: "quads", category: "legs" },
    { name: "Leg Extension", muscleGroup: "quads", category: "legs" },
    { name: "Nordic Curl", muscleGroup: "hamstrings", category: "legs" },
    { name: "Seated Calf Raise", muscleGroup: "calves", category: "legs" },
    { name: "Cable Crunch", muscleGroup: "abs", category: "legs" },
    { name: "Plank", muscleGroup: "abs", category: "legs" },
  ];

  for (const ex of exerciseData) {
    db.insert(exercises).values(ex).run();
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed on startup
  seedExercises();

  // === EXERCISES ===
  app.get("/api/exercises", async (_req, res) => {
    const data = await storage.getExercises();
    res.json(data);
  });

  app.get("/api/exercises/:category", async (req, res) => {
    const data = await storage.getExercisesByCategory(req.params.category);
    res.json(data);
  });

  // === WORKOUT LOGS ===
  app.get("/api/workout-logs", async (_req, res) => {
    const data = await storage.getWorkoutLogs();
    res.json(data);
  });

  app.get("/api/workout-logs/date/:date", async (req, res) => {
    const data = await storage.getWorkoutLogsByDate(req.params.date);
    res.json(data);
  });

  app.get("/api/workout-logs/exercise/:exerciseId", async (req, res) => {
    const data = await storage.getWorkoutLogsByExercise(Number(req.params.exerciseId));
    res.json(data);
  });

  app.post("/api/workout-logs", async (req, res) => {
    const parsed = insertWorkoutLogSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const log = await storage.createWorkoutLog(parsed.data);
    res.status(201).json(log);
  });

  app.delete("/api/workout-logs/:id", async (req, res) => {
    await storage.deleteWorkoutLog(Number(req.params.id));
    res.status(204).send();
  });

  // === PERSONAL RECORDS ===
  app.get("/api/personal-records", async (_req, res) => {
    const data = await storage.getPersonalRecords();
    res.json(data);
  });

  app.get("/api/personal-records/exercise/:exerciseId", async (req, res) => {
    const data = await storage.getPersonalRecordsByExercise(Number(req.params.exerciseId));
    res.json(data);
  });

  app.post("/api/personal-records", async (req, res) => {
    const parsed = insertPersonalRecordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }
    const pr = await storage.createPersonalRecord(parsed.data);
    res.status(201).json(pr);
  });

  return httpServer;
}
