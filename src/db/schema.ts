import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Exercise catalog - reusable exercise definitions
export const exercisesTable = pgTable("exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Workout sessions
export const workoutsTable = pgTable("workouts", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  name: varchar({ length: 255 }),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  notes: text(),
});

// Junction table linking exercises to workouts with ordering
export const workoutExercisesTable = pgTable("workout_exercises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutId: integer("workout_id")
    .notNull()
    .references(() => workoutsTable.id),
  exerciseId: integer("exercise_id")
    .notNull()
    .references(() => exercisesTable.id),
  order: integer().notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Individual sets within a workout exercise
export const setsTable = pgTable("sets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  workoutExerciseId: integer("workout_exercise_id")
    .notNull()
    .references(() => workoutExercisesTable.id),
  setNumber: integer("set_number").notNull(),
  reps: integer(),
  weight: decimal({ precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations for type-safe queries
export const workoutsRelations = relations(workoutsTable, ({ many }) => ({
  workoutExercises: many(workoutExercisesTable),
}));

export const exercisesRelations = relations(exercisesTable, ({ many }) => ({
  workoutExercises: many(workoutExercisesTable),
}));

export const workoutExercisesRelations = relations(
  workoutExercisesTable,
  ({ one, many }) => ({
    workout: one(workoutsTable, {
      fields: [workoutExercisesTable.workoutId],
      references: [workoutsTable.id],
    }),
    exercise: one(exercisesTable, {
      fields: [workoutExercisesTable.exerciseId],
      references: [exercisesTable.id],
    }),
    sets: many(setsTable),
  })
);

export const setsRelations = relations(setsTable, ({ one }) => ({
  workoutExercise: one(workoutExercisesTable, {
    fields: [setsTable.workoutExerciseId],
    references: [workoutExercisesTable.id],
  }),
}));
