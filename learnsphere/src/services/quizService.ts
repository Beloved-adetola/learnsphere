import { Auth } from '@/config/firebase';
import { Quiz, Question, QuizAttempt, QuizCategory } from '../types';

import { API_BASE_URL } from '@/config/api';

const getAuthHeaders = async () => {
  const token = await Auth.currentUser?.getIdToken();
  if (!token) throw new Error('User is not authenticated');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const QUIZ_CATEGORIES: QuizCategory[] = [
  'Programming',
  'Science',
  'Mathematics',
  'Electrical',
  'Accounting',
  'Marketing',
  'General Knowledge',
  'Other',
];

// Helper to map MongoDB _id to frontend id recursively
const mapQuizId = (q: any): Quiz => {
  if (!q) return q;
  return { 
    ...q, 
    id: q.id || q._id,
    questions: (q.questions || []).map((quest: any) => ({
      ...quest,
      id: quest.id || quest._id?.toString(),
      correctOptionId: quest.correctOptionId?.toString(),
      options: (quest.options || []).map((opt: any) => ({
        ...opt,
        id: opt.id || opt._id?.toString()
      }))
    }))
  };
};

const mapAttemptId = (a: any): QuizAttempt => {
  if (!a) return a;
  return { 
    ...a, 
    id: a.id || a._id?.toString(),
    // Normalize backend fields to frontend expectations
    totalQuestions: a.totalQuestions || a.total,
    answers: (a.answers || []).map((ans: any) => ({
      ...ans,
      questionId: ans.questionId?.toString(),
      selectedOptionId: (ans.selectedOptionId || ans.selectedAnswer)?.toString()
    }))
  };
};

// Get all published quizzes for candidates
export const getAvailableQuizzes = async (): Promise<Quiz[]> => {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE_URL}/candidate/quizzes`, {
    headers
  });
  if (!res.ok) throw new Error('Failed to fetch available quizzes');
  const data = await res.json();
  return data.map(mapQuizId);
};

// Admin / Candidate Methods
export const getQuizzes = async (): Promise<Quiz[]> => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/admin/quizzes`, { headers });
    
    // If we get unforbidded, it might be a candidate calling this. Let's fallback
    if (!response.ok) {
        if (response.status === 403) {
           const fallbackRes = await fetch(`${API_BASE_URL}/candidate/quizzes`, { headers });
           if (!fallbackRes.ok) throw new Error('Failed to fetch quizzes for candidate');
           const data = await fallbackRes.json();
           return data.map(mapQuizId);
        }
        throw new Error('Failed to fetch quizzes');
    }
    
    const data = await response.json();
    return data.map(mapQuizId);
  } catch (error) {
    console.error("getQuizzes error", error);
    return [];
  }
};

export const getQuizzesByCategory = async (category: string): Promise<Quiz[]> => {
  const quizzes = await getQuizzes();
  return quizzes.filter(quiz => quiz.category === category);
};

export const getQuizById = async (id: string, code?: string): Promise<Quiz | null> => {
  try {
    const headers = await getAuthHeaders();
    const url = code ? `${API_BASE_URL}/candidate/quizzes/${id}?code=${code}` : `${API_BASE_URL}/candidate/quizzes/${id}`;
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('invalid_code');
      }
      return null;
    }
    
    const data = await response.json();
    return mapQuizId(data);
  } catch(error) {
    if (error instanceof Error && error.message === 'invalid_code') {
      throw error;
    }
    return null;
  }
};

export const createQuiz = async (quiz: Omit<Quiz, 'id' | 'createdAt'>): Promise<Quiz> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/admin/quizzes`, {
    method: 'POST',
    headers,
    body: JSON.stringify(quiz)
  });
  if (!response.ok) throw new Error('Failed to create quiz');
  const data = await response.json();
  return mapQuizId(data);
};

export const updateQuiz = async (id: string, updates: Partial<Quiz>): Promise<Quiz> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/admin/quizzes/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(updates)
  });
  if (!response.ok) throw new Error('Failed to update quiz');
  const data = await response.json();
  return mapQuizId(data);
};

export const deleteQuiz = async (id: string): Promise<void> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/admin/quizzes/${id}`, {
    method: 'DELETE',
    headers
  });
  if (!response.ok) throw new Error('Failed to delete quiz');
};

export const submitQuizAttempt = async (attempt: Omit<QuizAttempt, 'id' | 'score' | 'completedAt'>): Promise<QuizAttempt> => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/candidate/quizzes/${attempt.quizId}/submit`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ answers: attempt.answers })
  });
  if (!response.ok) throw new Error('Failed to submit attempt');
  const data = await response.json();
  return mapAttemptId({ ...attempt, ...data });
};

export const getQuizAttemptsByUser = async (userId: string): Promise<QuizAttempt[]> => {
  try {
     const headers = await getAuthHeaders();
     const response = await fetch(`${API_BASE_URL}/candidate/history`, { headers });
     if (!response.ok) throw new Error('Failed to fetch history');
     const data = await response.json();
     return data.map(mapAttemptId);
  } catch(error) {
     return [];
  }
};
