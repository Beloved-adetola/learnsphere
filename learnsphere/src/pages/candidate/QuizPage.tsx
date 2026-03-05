
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import QuizTaking from '@/components/candidate/QuizTaking';

const QuizPage: React.FC = () => {
  const { currentUser } = useAuth();

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="quiz-container py-8">
      <QuizTaking />
    </div>
  );
};

export default QuizPage;
