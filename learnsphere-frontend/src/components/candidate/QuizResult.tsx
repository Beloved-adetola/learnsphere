
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Home, RotateCcw } from 'lucide-react';
import { Quiz, QuizAttempt } from '@/types';

interface QuizResultProps {
  quiz: Quiz;
  attempt: QuizAttempt;
}

const QuizResult: React.FC<QuizResultProps> = ({ quiz, attempt }) => {
  const navigate = useNavigate();
  
  const score = attempt.score;
  const totalQuestions = attempt.totalQuestions;
  const percentage = Math.round((score / totalQuestions) * 100);
  
  let resultMessage = '';
  let resultClass = '';
  
  if (percentage >= 90) {
    resultMessage = 'Excellent!';
    resultClass = 'text-green-600';
  } else if (percentage >= 70) {
    resultMessage = 'Good job!';
    resultClass = 'text-green-500';
  } else if (percentage >= 50) {
    resultMessage = 'Well done!';
    resultClass = 'text-amber-500';
  } else {
    resultMessage = 'Keep practicing!';
    resultClass = 'text-red-500';
  }
  
  const getQuestionById = (questionId: string) => {
    return quiz.questions.find(q => {
      const qId = q.id || (q as { _id?: string })._id?.toString();
      return qId === questionId;
    });
  };
  
  const getSelectedOption = (questionId: string) => {
    interface LegacyAnswer {
      questionId?: string;
      selectedOptionId?: string;
      selectedAnswer?: string;
    }
    const answer = attempt.answers.find(a => {
      const legacy = a as unknown as LegacyAnswer;
      return (legacy.questionId || '').toString() === questionId.toString();
    });
    const legacyAnswer = answer as unknown as LegacyAnswer;
    return legacyAnswer ? (legacyAnswer.selectedOptionId || legacyAnswer.selectedAnswer) : null;
  };
  
  const isMaxAttemptsReached = quiz.maxAttempts > 0 && (quiz.userAttemptCount !== undefined) && (quiz.userAttemptCount + 1) >= quiz.maxAttempts;
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Quiz Results</CardTitle>
          <CardDescription>{quiz.title}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className={`text-3xl font-bold mb-1 ${resultClass}`}>
              {resultMessage}
            </h3>
            <p className="text-lg font-medium">
              Your score: {score}/{totalQuestions} ({percentage}%)
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Score</span>
              <span>{percentage}%</span>
            </div>
            <Progress value={percentage} className="h-3" />
          </div>

          {isMaxAttemptsReached && (
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800 text-center">
              You have reached the maximum number of attempts allowed for this quiz ({quiz.maxAttempts}).
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => navigate('/candidate/dashboard')}
          >
            <Home className="h-4 w-4" />
            Back to Dashboard
          </Button>
          {!isMaxAttemptsReached && (
            <Button 
              className="flex items-center gap-2"
              onClick={() => navigate(`/candidate/quiz/${quiz.id}`)}
            >
              <RotateCcw className="h-4 w-4" />
              Take Quiz Again
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <h2 className="text-xl font-bold mb-4">Detailed Results</h2>
      
      <div className="space-y-6">
        {quiz.questions.map((question, index) => {
          const qId = question.id || (question as { _id?: string })._id?.toString();
          if (!qId) return null;
          
          const selectedOptionId = getSelectedOption(qId);
          const isCorrect = selectedOptionId?.toString() === question.correctOptionId?.toString();
          
          return (
            <Card key={qId} className={`border-l-4 ${
              isCorrect ? 'border-l-green-500' : 'border-l-red-500'
            }`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-medium">
                    Question {index + 1}: {question.text}
                  </CardTitle>
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {question.options.map((option) => {
                    const optId = option.id || (option as { _id?: string })._id?.toString();
                    const isSelected = selectedOptionId?.toString() === optId?.toString();
                    const isCorrectOption = optId?.toString() === question.correctOptionId?.toString();
                    
                    let optionClass = 'border-slate-200';
                    let statusLabel: string | null = null;

                    if (isCorrectOption) {
                      optionClass = 'bg-green-100 border-green-500 text-green-900 font-medium ring-1 ring-green-500';
                      statusLabel = isSelected ? "Your Answer (Correct)" : "Correct Answer";
                    } else if (isSelected) {
                      optionClass = 'bg-red-100 border-red-500 text-red-900 font-medium ring-1 ring-red-500';
                      statusLabel = "Your Answer (Incorrect)";
                    }
                    
                    return (
                      <div
                        key={optId}
                        className={`p-3 border rounded-md flex items-center justify-between gap-2 shadow-sm ${optionClass}`}
                      >
                        <div className="flex items-center gap-2">
                          {isCorrectOption ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : isSelected ? (
                            <XCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <span className="h-4 w-4 block" />
                          )}
                          <span>{option.text}</span>
                        </div>
                        {statusLabel && (
                          <span className="text-[10px] uppercase tracking-wider font-bold">
                            {statusLabel}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default QuizResult;
