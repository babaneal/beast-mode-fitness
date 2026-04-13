import { pgTable, text, integer, serial, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Exercises library - pre-populated with PPL exercises
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  muscleGroup: text("muscle_group").notNull(),
  category: text("category").notNull(),
});

// Workout log entries - tracks each set
export const workoutLogs = pgTable("workout_logs", {
  id: serial("id").primaryKey(),
  exerciseId: integer("exercise_id").notNull(),
  date: text("date").notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weight: doublePrecision("weight").notNull(),
  notes: text("notes"),
});

// Personal records
export const personalRecords = pgTable("personal_records", {
  id: serial("id").primaryKey(),
  exerciseId: integer("exercise_id").notNull(),
  weight: doublePrecision("weight").notNull(),
  reps: integer("reps").notNull(),
  date: text("date").notNull(),
});

// Insert schemas
export const insertExerciseSchema = createInsertSchema(exercises).omit({ id: true });
export const insertWorkoutLogSchema = createInsertSchema(workoutLogs).omit({ id: true });
export const insertPersonalRecordSchema = createInsertSchema(personalRecords).omit({ id: true });

// Types
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type InsertWorkoutLog = z.infer<typeof insertWorkoutLogSchema>;
export type PersonalRecord = typeof personalRecords.$inferSelect;
export type InsertPersonalRecord = z.infer<typeof insertPersonalRecordSchema>;
