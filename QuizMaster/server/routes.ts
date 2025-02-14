import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { insertQuizSchema, insertQuizAttemptSchema } from "@shared/schema";
import passport from "passport";

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

function isTeacher(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === "teacher") {
    return next();
  }
  res.status(403).json({ message: "Forbidden" });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  await setupAuth(app);

  // Auth routes
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false) => {
      if (err) {
        console.error("Login error:", err);
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.logIn(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return next(err);
        }
        res.json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.user);
  });

  // Quiz routes
  app.get("/api/quizzes", isAuthenticated, async (req, res) => {
    const quizzes = await storage.getQuizzes();
    res.json(quizzes);
  });

  app.get("/api/quizzes/:id", isAuthenticated, async (req, res) => {
    try {
      const quiz = await storage.getQuiz(Number(req.params.id));
      if (!quiz) {
        res.status(404).json({ message: "Quiz not found" });
        return;
      }
      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Error fetching quiz" });
    }
  });

  // Teacher-only routes
  app.post("/api/quizzes", isAuthenticated, isTeacher, async (req, res) => {
    const parseResult = insertQuizSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid quiz data" });
    }
    const quiz = await storage.createQuiz(parseResult.data);
    res.status(201).json(quiz);
  });

  app.get("/api/teacher/quizzes", isAuthenticated, isTeacher, async (req, res) => {
    const quizzes = await storage.getTeacherQuizzes(req.user!.id);
    res.json(quizzes);
  });

  app.get("/api/teacher/quiz/:id/attempts", isAuthenticated, isTeacher, async (req, res) => {
    const attempts = await storage.getQuizAttempts(Number(req.params.id));
    res.json(attempts);
  });

  // Student routes
  app.post("/api/attempts", isAuthenticated, async (req, res) => {
    const parseResult = insertQuizAttemptSchema.safeParse({
      ...req.body,
      studentId: req.user!.id,
      submittedAt: new Date().toISOString(),
      completed: true // Ensure completed is set
    });

    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid attempt data" });
    }

    const attempt = await storage.createQuizAttempt(parseResult.data);
    res.json(attempt);
  });

  app.get("/api/attempts/:id", isAuthenticated, async (req, res) => {
    const attempt = await storage.getQuizAttempt(Number(req.params.id));
    if (!attempt) {
      res.status(404).json({ message: "Attempt not found" });
      return;
    }
    if (attempt.studentId !== req.user!.id && req.user!.role !== "teacher") {
      return res.status(403).json({ message: "Forbidden" });
    }
    res.json(attempt);
  });

  app.get("/api/student/attempts", isAuthenticated, async (req, res) => {
    const attempts = await storage.getStudentAttempts(req.user!.id);
    res.json(attempts);
  });

  const httpServer = createServer(app);
  return httpServer;
}