import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'teacher' or 'student'
  name: text("name").notNull(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  timeLimit: integer("time_limit").notNull(), // in seconds
  questions: jsonb("questions").$type<QuizQuestion[]>().notNull(),
  teacherId: integer("teacher_id").notNull(), // reference to users table
  subject: text("subject").notNull(),
});

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").notNull(),
  studentId: integer("student_id").notNull(), // reference to users table
  score: integer("score").notNull(),
  answers: jsonb("answers").$type<number[]>().notNull(),
  completed: boolean("completed").notNull().default(false),
  submittedAt: text("submitted_at").notNull(),
});

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswer: number;
};

export const insertUserSchema = createInsertSchema(users);
export const insertQuizSchema = createInsertSchema(quizzes);
export const insertQuizAttemptSchema = createInsertSchema(quizAttempts);

export type User = typeof users.$inferSelect;
export type Quiz = typeof quizzes.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type InsertQuiz = typeof quizzes.$inferInsert;
export type InsertQuizAttempt = typeof quizAttempts.$inferInsert;

// Mock quiz data
export const mockQuizzes: InsertQuiz[] = [
  {
    title: "Comprehensive General Knowledge Quiz",
    description: "A thorough test of your general knowledge across various topics",
    timeLimit: 1800, // 30 minutes
    teacherId: 1,
    subject: "General Knowledge",
    questions: [
      {
        question: "Which is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correctAnswer: 3
      },
      {
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
        correctAnswer: 1
      },
      {
        question: "What is the capital of Japan?",
        options: ["Seoul", "Beijing", "Tokyo", "Bangkok"],
        correctAnswer: 2
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correctAnswer: 1
      },
      {
        question: "Who wrote 'Romeo and Juliet'?",
        options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"],
        correctAnswer: 1
      },
      {
        question: "What is the chemical symbol for gold?",
        options: ["Ag", "Fe", "Au", "Cu"],
        correctAnswer: 2
      },
      {
        question: "Which country is home to the Great Barrier Reef?",
        options: ["Brazil", "Indonesia", "Australia", "Thailand"],
        correctAnswer: 2
      },
      {
        question: "What is the largest mammal in the world?",
        options: ["African Elephant", "Blue Whale", "Giraffe", "Polar Bear"],
        correctAnswer: 1
      },
      {
        question: "In which year did World War II end?",
        options: ["1943", "1944", "1945", "1946"],
        correctAnswer: 2
      },
      {
        question: "What is the currency of Brazil?",
        options: ["Peso", "Real", "Dollar", "Euro"],
        correctAnswer: 1
      },
      {
        question: "Who is known as the father of computers?",
        options: ["Charles Babbage", "Alan Turing", "Bill Gates", "Steve Jobs"],
        correctAnswer: 0
      },
      {
        question: "Which is the longest river in the world?",
        options: ["Amazon", "Nile", "Mississippi", "Yangtze"],
        correctAnswer: 1
      },
      {
        question: "What is the hardest natural substance on Earth?",
        options: ["Gold", "Iron", "Diamond", "Platinum"],
        correctAnswer: 2
      },
      {
        question: "Who was the first woman to win a Nobel Prize?",
        options: ["Marie Curie", "Mother Teresa", "Jane Addams", "Pearl Buck"],
        correctAnswer: 0
      },
      {
        question: "What is the smallest country in the world?",
        options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"],
        correctAnswer: 2
      }
    ]
  },
  {
    title: "Advanced Science Quiz",
    description: "Test your knowledge of various scientific concepts and discoveries",
    timeLimit: 1800, // 30 minutes
    teacherId: 1,
    subject: "Science",
    questions: [
      {
        question: "What is the speed of light approximately?",
        options: ["299,792 km/s", "199,792 km/s", "399,792 km/s", "499,792 km/s"],
        correctAnswer: 0
      },
      {
        question: "What is the atomic number of carbon?",
        options: ["4", "6", "8", "12"],
        correctAnswer: 1
      },
      {
        question: "Which of these is not a type of electromagnetic radiation?",
        options: ["X-rays", "Gamma rays", "Sound waves", "Ultraviolet"],
        correctAnswer: 2
      },
      {
        question: "What is the process by which plants make their own food?",
        options: ["Photosynthesis", "Respiration", "Fermentation", "Decomposition"],
        correctAnswer: 0
      },
      {
        question: "What is the largest organ in the human body?",
        options: ["Brain", "Liver", "Heart", "Skin"],
        correctAnswer: 3
      },
      {
        question: "Which element has the chemical symbol 'Fe'?",
        options: ["Iron", "Fluorine", "Francium", "Iodine"],
        correctAnswer: 0
      },
      {
        question: "What is the name of the force that keeps planets orbiting the Sun?",
        options: ["Nuclear force", "Electromagnetic force", "Gravitational force", "Centripetal force"],
        correctAnswer: 2
      },
      {
        question: "Which of these is not a state of matter?",
        options: ["Plasma", "Energy", "Gas", "Solid"],
        correctAnswer: 1
      },
      {
        question: "What is the unit of electrical resistance?",
        options: ["Volt", "Ampere", "Ohm", "Watt"],
        correctAnswer: 2
      },
      {
        question: "Which planet has the most moons?",
        options: ["Jupiter", "Saturn", "Uranus", "Neptune"],
        correctAnswer: 1
      },
      {
        question: "What is the smallest unit of life?",
        options: ["Atom", "Cell", "Molecule", "Tissue"],
        correctAnswer: 1
      },
      {
        question: "Which gas makes up the majority of Earth's atmosphere?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
        correctAnswer: 2
      },
      {
        question: "What is the study of fossils called?",
        options: ["Paleontology", "Archaeology", "Geology", "Biology"],
        correctAnswer: 0
      },
      {
        question: "What type of energy is stored in chemical bonds?",
        options: ["Kinetic", "Potential", "Thermal", "Nuclear"],
        correctAnswer: 1
      },
      {
        question: "Which of these is not one of Newton's laws of motion?",
        options: ["Law of inertia", "Law of acceleration", "Law of conservation", "Law of reaction"],
        correctAnswer: 2
      }
    ]
  },
  {
    title: "History Through the Ages",
    description: "Journey through time with this comprehensive history quiz",
    timeLimit: 1800, // 30 minutes
    teacherId: 1,
    subject: "History",
    questions: [
      {
        question: "In which year did Christopher Columbus first reach the Americas?",
        options: ["1492", "1498", "1502", "1510"],
        correctAnswer: 0
      },
      {
        question: "Who was the first Emperor of China?",
        options: ["Qin Shi Huang", "Sun Yat-sen", "Kublai Khan", "Wu Zetian"],
        correctAnswer: 0
      },
      {
        question: "Which ancient wonder was located in Alexandria, Egypt?",
        options: ["Colossus of Rhodes", "Hanging Gardens", "Great Lighthouse", "Temple of Artemis"],
        correctAnswer: 2
      },
      {
        question: "What was the main cause of the French Revolution?",
        options: ["Foreign invasion", "Social inequality", "Natural disasters", "Religious conflict"],
        correctAnswer: 1
      },
      {
        question: "Who wrote 'The Art of War'?",
        options: ["Confucius", "Sun Tzu", "Lao Tzu", "Buddha"],
        correctAnswer: 1
      },
      {
        question: "Which empire was known as 'the empire on which the sun never sets'?",
        options: ["Roman Empire", "Ottoman Empire", "British Empire", "Mongol Empire"],
        correctAnswer: 2
      },
      {
        question: "In which year did World War I begin?",
        options: ["1912", "1914", "1916", "1918"],
        correctAnswer: 1
      },
      {
        question: "Who was the first woman to win a Nobel Prize?",
        options: ["Mother Teresa", "Marie Curie", "Jane Addams", "Pearl Buck"],
        correctAnswer: 1
      },
      {
        question: "Which civilization built the Machu Picchu?",
        options: ["Aztecs", "Mayans", "Incas", "Olmecs"],
        correctAnswer: 2
      },
      {
        question: "What was the Renaissance primarily known for?",
        options: ["Industrial progress", "Cultural rebirth", "Military conquests", "Religious reform"],
        correctAnswer: 1
      },
      {
        question: "Who was the first President of the United States?",
        options: ["John Adams", "Thomas Jefferson", "Benjamin Franklin", "George Washington"],
        correctAnswer: 3
      },
      {
        question: "Which event marked the end of the Cold War?",
        options: ["Fall of Berlin Wall", "Cuban Missile Crisis", "Korean War", "Vietnam War"],
        correctAnswer: 0
      },
      {
        question: "What was the name of the first artificial satellite in space?",
        options: ["Explorer 1", "Vanguard 1", "Sputnik 1", "Apollo 1"],
        correctAnswer: 2
      },
      {
        question: "Which queen had the longest reign in British history until Elizabeth II?",
        options: ["Queen Victoria", "Queen Anne", "Queen Mary", "Queen Elizabeth I"],
        correctAnswer: 0
      },
      {
        question: "What was the main purpose of the Silk Road?",
        options: ["Religious pilgrimages", "Military campaigns", "Trade routes", "Cultural exchange"],
        correctAnswer: 2
      }
    ]
  }
];

// Add mock quiz attempts
export const mockQuizAttempts: InsertQuizAttempt[] = [
  {
    quizId: 1,
    studentId: 2, // student1's ID
    score: 80,
    answers: [3, 1, 2, 1, 1, 2, 2, 1, 2, 1, 0, 1, 2, 0, 2], // Sample answers for the first quiz
    completed: true,
    submittedAt: new Date().toISOString()
  }
];

// Mock users data
export const mockUsers: InsertUser[] = [
  {
    username: "teacher1",
    password: "password123", // This will be hashed before storage
    role: "teacher",
    name: "John Smith"
  },
  {
    username: "student1",
    password: "password123", // This will be hashed before storage
    role: "student",
    name: "Alice Johnson"
  }
];