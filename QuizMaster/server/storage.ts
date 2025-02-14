import type { Store } from "express-session";
import {
  type Quiz,
  type QuizAttempt,
  type User,
  type InsertQuiz,
  type InsertQuizAttempt,
  type InsertUser,
  mockQuizzes,
  mockUsers,
  mockQuizAttempts
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Quiz operations
  getQuizzes(): Promise<Quiz[]>;
  getQuiz(id: number): Promise<Quiz | undefined>;
  getTeacherQuizzes(teacherId: number): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;

  // Quiz attempt operations
  createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt>;
  getQuizAttempt(id: number): Promise<QuizAttempt | undefined>;
  getStudentAttempts(studentId: number): Promise<QuizAttempt[]>;
  getQuizAttempts(quizId: number): Promise<QuizAttempt[]>;
  updateQuizAttempt(id: number, attempt: Partial<QuizAttempt>): Promise<QuizAttempt>;

  // Session store for auth
  sessionStore: Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quizzes: Map<number, Quiz>;
  private attempts: Map<number, QuizAttempt>;
  private currentUserId: number;
  private currentQuizId: number;
  private currentAttemptId: number;
  sessionStore: Store;

  constructor() {
    this.users = new Map();
    this.quizzes = new Map();
    this.attempts = new Map();
    this.currentUserId = 1;
    this.currentQuizId = 1;
    this.currentAttemptId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });

    // Initialize with mock quizzes
    mockQuizzes.forEach(quiz => {
      const id = this.currentQuizId++;
      this.quizzes.set(id, { ...quiz, id });
    });

    // Initialize with mock quiz attempts
    mockQuizAttempts.forEach(attempt => {
      const id = this.currentAttemptId++;
      this.attempts.set(id, { ...attempt, id });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Quiz operations
  async getQuizzes(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values());
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async getTeacherQuizzes(teacherId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(
      quiz => quiz.teacherId === teacherId
    );
  }

  async createQuiz(quiz: InsertQuiz): Promise<Quiz> {
    const id = this.currentQuizId++;
    const newQuiz: Quiz = { ...quiz, id };
    this.quizzes.set(id, newQuiz);
    return newQuiz;
  }

  // Quiz attempt operations
  async createQuizAttempt(attempt: InsertQuizAttempt): Promise<QuizAttempt> {
    const id = this.currentAttemptId++;
    // Ensure completed is set and provide default value if not present
    const quizAttempt: QuizAttempt = {
      ...attempt,
      id,
      completed: attempt.completed ?? false
    };
    this.attempts.set(id, quizAttempt);
    return quizAttempt;
  }

  async getQuizAttempt(id: number): Promise<QuizAttempt | undefined> {
    return this.attempts.get(id);
  }

  async getStudentAttempts(studentId: number): Promise<QuizAttempt[]> {
    return Array.from(this.attempts.values()).filter(
      attempt => attempt.studentId === studentId
    );
  }

  async getQuizAttempts(quizId: number): Promise<QuizAttempt[]> {
    return Array.from(this.attempts.values()).filter(
      attempt => attempt.quizId === quizId
    );
  }

  async updateQuizAttempt(id: number, update: Partial<QuizAttempt>): Promise<QuizAttempt> {
    const attempt = this.attempts.get(id);
    if (!attempt) {
      throw new Error("Attempt not found");
    }
    const updatedAttempt = { ...attempt, ...update };
    this.attempts.set(id, updatedAttempt);
    return updatedAttempt;
  }
}

export const storage = new MemStorage();