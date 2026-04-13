import {
  type Exercise, type InsertExercise, exercises,
  type WorkoutLog, type InsertWorkoutLog, workoutLogs,
  type PersonalRecord, type InsertPersonalRecord, personalRecords,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, and } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

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
    return db.select().from(exercises).all();
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    return db.select().from(exercises).where(eq(exercises.category, category)).all();
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    return db.insert(exercises).values(exercise).returning().get();
  }

  async getWorkoutLogs(): Promise<WorkoutLog[]> {
    return db.select().from(workoutLogs).orderBy(desc(workoutLogs.date)).all();
  }

  async getWorkoutLogsByDate(date: string): Promise<WorkoutLog[]> {
    return db.select().from(workoutLogs).where(eq(workoutLogs.date, date)).all();
  }

  async getWorkoutLogsByExercise(exerciseId: number): Promise<WorkoutLog[]> {
    return db.select().from(workoutLogs).where(eq(workoutLogs.exerciseId, exerciseId)).orderBy(desc(workoutLogs.date)).all();
  }

  async createWorkoutLog(log: InsertWorkoutLog): Promise<WorkoutLog> {
    return db.insert(workoutLogs).values(log).returning().get();
  }

  async deleteWorkoutLog(id: number): Promise<void> {
    db.delete(workoutLogs).where(eq(workoutLogs.id, id)).run();
  }

  async getPersonalRecords(): Promise<PersonalRecord[]> {
    return db.select().from(personalRecords).orderBy(desc(personalRecords.date)).all();
  }

  async getPersonalRecordsByExercise(exerciseId: number): Promise<PersonalRecord[]> {
    return db.select().from(personalRecords).where(eq(personalRecords.exerciseId, exerciseId)).orderBy(desc(personalRecords.date)).all();
  }

  async createPersonalRecord(pr: InsertPersonalRecord): Promise<PersonalRecord> {
    return db.insert(personalRecords).values(pr).returning().get();
  }
}

export const storage = new DatabaseStorage();
