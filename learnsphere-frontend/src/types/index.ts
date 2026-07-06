
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'candidate';
  name?: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctOptionId: string;
}

export interface Option {
  id: string;
  text: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[];
  createdBy: string;
  createdAt: Date;
  updatedAt?: Date;
  isPublished: boolean;
  maxAttempts: number;
  timeLimit: number; // in minutes
  password?: string; // Optional on client unless we need to show it to admin
  userAttemptCount?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: {
    questionId: string;
    selectedOptionId: string | null;
  }[];
  score: number;
  totalQuestions: number;
  completedAt: Date;
  quiz?: Quiz;
}

export type QuizCategory = 
  | 'Programming'
  | 'Science'
  | 'Mathematics'
  | 'Electrical'
  | 'Accounting'
  | 'Marketing'
  | 'General Knowledge'
  | 'Other';
