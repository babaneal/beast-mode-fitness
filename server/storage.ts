import {
  type Exercise, type InsertExercise, exercises,
  type WorkoutLog, type InsertWorkoutLog, workoutLogs,
  type PersonalRecord, type InsertPersonalRecord, personalRecords,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, desc } from "drizzle-orm";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool);

export interface IStorage {
  // Exercises
  getExercises(): Promise<Exercise[]>;
  getExercisesByCategory(category: string): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  
  // Workout Logs
  getWorkoutLogs(): Promise<WorkoutLog[]>;
  getWorkoutLogsByDate(date: string): Promise<WorkoutLog[]>;
  getWorkoutLogsByExercise(exerciseId: number): Promise<WorkoutLog[]>;
  createWorkoutLog(log: InsertWorkoutLog): Promise<WorkoutLog>;
  deleteWorkoutLog(id: number): Promise<void>;
  
  // Personal Records
  getPersonalRecords(): Promise<PersonalRecord[]>;
  getPersonalRecordsByExercise(exerciseId: number): Promise<PersonalRecord[]>;
  createPersonalRecord(pr: InsertPersonalRecord): Promise<PersonalRecord>;
}

export class DatabaseStorage implements IStorage {
  async getExercises(): Promise<Exercise[]> {
    return db.select().from(exercises);
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    return db.select().from(exercises).where(eq(exercises.category, category));
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const [result] = await db.insert(exercises).values(exercise).returning();
    return result;
  }

  async getWorkoutLogs(): Promise<WorkoutLog[]> {
    return db.select().from(workoutLogs).orderBy(desc(workoutLogs.date));
  }

  async getWorkoutLogsByDate(date: string): Promise<WorkoutLog[]> {
    return db.select().from(workoutLogs).where(eq(workoutLogs.date, date));
  }

  async getWorkoutLogsByExercise(exerciseId: number): Promise<WorkoutLog[]> {
    return db.select().from(workoutLogs).where(eq(workoutLogs.exerciseId, exerciseId)).orderBy(desc(workoutLogs.date));
  }

  async createWorkoutLog(log: InsertWorkoutLog): Promise<WorkoutLog> {
    const [result] = await db.insert(workoutLogs).values(log).returning();
    return result;
  }

  async deleteWorkoutLog(id: number): Promise<void> {
    await db.delete(workoutLogs).where(eq(workoutLogs.id, id));
  }

  async getPersonalRecords(): Promise<PersonalRecord[]> {
    return db.select().from(personalRecords).orderBy(desc(personalRecords.date));
  }

  async getPersonalRecordsByExercise(exerciseId: number): Promise<PersonalRecord[]> {
    return db.select().from(personalRecords).where(eq(personalRecords.exerciseId, exerciseId)).orderBy(desc(personalRecords.date));
  }

  async createPersonalRecord(pr: InsertPersonalRecord): Promise<PersonalRecord> {
    const [result] = await db.insert(personalRecords).values(pr).returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
