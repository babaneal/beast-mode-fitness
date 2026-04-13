import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Exercises library - pre-populated with PPL exercises
export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  muscleGroup: text("muscle_group").notNull(), // chest, back, shoulders, biceps, triceps, quads, hamstrings, calves, abs, compound
  category: text("category").notNull(), // push, pull, legs
});

// Workout log entries - tracks each set
export const workoutLogs = sqliteTable("workout_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  exerciseId: integer("exercise_id").notNull(),
  date: text("date").notNull(), // ISO date string YYYY-MM-DD
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weight: real("weight").notNull(), // in lbs
  notes: text("notes"),
});

// Personal records
export const personalRecords = sqliteTable("personal_records", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  exerciseId: integer("exercise_id").notNull(),
  weight: real("weight").notNull(),
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
