
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, Lock } from 'lucide-react';
import { Quiz, QuizAttempt } from '@/types';
import { getQuizById, submitQuizAttempt } from '@/services/quizService';
import { useAuth } from '@/context/AuthContext';
import QuizResult from './QuizResult';
import { Label } from '../ui/label';

const QuizTaking: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizAttempt | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  // Organization Code Gateway
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [quizPassword, setQuizPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Initial load is just finishing "loading" state since we defer fetching until code entry
  useEffect(() => {
    setLoading(false);
  }, []);
  
  // Timer countdown logic
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || quizResult || !isCodeVerified) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev !== null && prev <= 1) {
          clearInterval(timer);
          setIsTimeUp(true);
          return 0;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizResult, isCodeVerified]);

  // Stable handleSubmit to avoid stale closures
  const handleSubmit = React.useCallback(async () => {
    if (!quiz || !currentUser) return;
    
    setIsSubmitting(true);
    setShowSubmitDialog(false);
    
    try {
      // Prepare submission data - more robust mapping
      const submissionAnswers = quiz.questions.map(q => ({
        questionId: q.id,
        selectedOptionId: selectedOptions[q.id] || null
      }));

      const submission = {
        quizId: quiz.id,
        userId: currentUser.id,
        answers: submissionAnswers,
        totalQuestions: quiz.questions.length,
      };
      
      console.log("Submitting quiz attempt:", submission);
      
      // Submit quiz
      const result = await submitQuizAttempt(submission);
      setQuizResult(result);
      
      toast({
        title: 'Quiz submitted',
        description: 'Your answers have been submitted successfully.',
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        variant: 'destructive',
        title: 'Submission failed',
        description: 'Failed to submit your answers. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [quiz, currentUser, selectedOptions, toast]);

  // Handle auto-submit when time is up
  useEffect(() => {
    if (isTimeUp && !quizResult && !isSubmitting) {
      toast({
        variant: 'destructive',
        title: "Time's up!",
        description: "Your quiz is being submitted automatically.",
      });
      handleSubmit();
    }
  }, [isTimeUp, quizResult, isSubmitting, handleSubmit, toast]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizId || !quizPassword.trim()) return;
    
    setIsVerifying(true);
    try {
      const quizData = await getQuizById(quizId, quizPassword);
      if (!quizData) {
        toast({
          variant: 'destructive',
          title: 'Quiz not found',
          description: 'The requested quiz could not be found.',
        });
        navigate('/candidate/dashboard');
        return;
      }
      
      setQuiz(quizData);
      setIsCodeVerified(true);
      
      // Initialize timer if limit exists
      if (quizData.timeLimit > 0) {
        setTimeLeft(quizData.timeLimit * 60);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'invalid_code') {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'Invalid or missing quiz password.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Failed to access the quiz. Please try again.',
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleOptionSelect = React.useCallback((questionId: string, optionId: string) => {
    if (!questionId) {
      console.error("QuizTaking: Cannot select option, questionId is missing");
      return;
    }
    console.log(`QuizTaking: Selecting option ${optionId} for question ${questionId}`);
    setSelectedOptions(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  }, []);
  
  const handleNext = () => {
    if (!quiz) return;
    
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // On last question, show submit dialog
      setShowSubmitDialog(true);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Original handleSubmit removed from here as it's now defined above with useCallback
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Render Organization Code Gateway
  if (!isCodeVerified) {
    return (
      <div className="max-w-md mx-auto pt-12">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate('/candidate/dashboard')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Lock className="h-5 w-5 text-primary" />
              <CardTitle className="text-2xl">Quiz Password Required</CardTitle>
            </div>
            <CardDescription>
              This is a private quiz. Enter the password provided by your instructor to access it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="verify-code-form" onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quizPassword">Password</Label>
                <div className="flex gap-2">
                  <input
                    id="quizPassword"
                    type="password"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter quiz password"
                    value={quizPassword}
                    onChange={(e) => setQuizPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              form="verify-code-form" 
              className="w-full"
              disabled={isVerifying || !quizPassword.trim()}
            >
              {isVerifying ? 'Verifying...' : 'Access Quiz'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (!quiz) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Quiz not found</h3>
        <p className="text-muted-foreground mb-6">
          The requested quiz could not be found.
        </p>
        <Button onClick={() => navigate('/candidate/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  // If quiz is completed, show results
  if (quizResult) {
    return <QuizResult quiz={quiz} attempt={quizResult} />;
  }
  
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="max-w-3xl mx-auto pt-12 text-center">
        <XCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h3 className="text-xl font-bold">This quiz has no questions</h3>
        <p className="text-muted-foreground mb-6">
          The instructor has not added any questions to this quiz yet.
        </p>
        <Button onClick={() => navigate('/candidate/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isMaxAttemptsReached = quiz.maxAttempts > 0 && 
    quiz.userAttemptCount !== undefined && 
    quiz.userAttemptCount >= quiz.maxAttempts;

  if (isMaxAttemptsReached) {
    return (
      <div className="max-w-3xl mx-auto pt-12 text-center">
        <XCircle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-xl font-bold">Attempt Limit Reached</h3>
        <p className="text-muted-foreground mb-6">
          You have already completed the maximum allowed attempts ({quiz.maxAttempts}) for this quiz.
        </p>
        <Button onClick={() => navigate('/candidate/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  const currentQuestion = quiz.questions[currentQuestionIndex];
  // Backend might return _id instead of id if populate is used with lean()
  const qId = currentQuestion?.id || (currentQuestion as { _id?: string | object })._id?.toString();
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isAnswered = !!(qId && selectedOptions[qId]);

  console.log("QuizTaking State:", {
    currentQuestionIndex,
    qId,
    isAnswered,
    hasSelectedOptions: Object.keys(selectedOptions).length,
    selectedForThis: qId ? selectedOptions[qId] : 'none'
  });
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Button 
          variant="outline" 
          className="mb-4"
          onClick={() => navigate('/candidate/dashboard')}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
        <p className="text-muted-foreground mb-4">{quiz.description}</p>
        
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {timeLeft !== null && !quizResult && (
          <Card className={`mt-4 border-none shadow-md ${timeLeft < 60 ? 'bg-red-50' : 'bg-primary/5'}`}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className={`h-5 w-5 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
                  <span className={`font-mono text-xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-primary'}`}>
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
                <div className="flex-grow mx-4">
                  <Progress 
                    value={(timeLeft / (quiz.timeLimit * 60)) * 100} 
                    className={`h-2 ${timeLeft < 60 ? '[&>div]:bg-red-500' : ''}`}
                  />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Time Remaining
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold leading-7">
            {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const optId = option.id || (option as { _id?: string | object })._id?.toString();
              if (!optId) return null;
              const isSelected = qId ? selectedOptions[qId] === optId : false;
              
              return (
                <div 
                  key={optId} 
                  onClick={() => {
                    console.log(`QuizTaking: Manually selecting option ${optId} for question ${qId}`);
                    if (qId) handleOptionSelect(qId, optId);
                  }}
                  className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-all hover:bg-muted/50 ${
                    isSelected 
                      ? "border-primary bg-primary/5 ring-1 ring-primary" 
                      : "border-input"
                  }`}
                >
                  <div className={`h-5 w-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                    isSelected ? "border-primary" : "border-slate-300"
                  }`}>
                    {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className={`flex-grow ${isSelected ? "font-semibold text-primary" : ""}`}>
                    {option.text}
                  </span>
                  {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!isAnswered}
          >
            {currentQuestionIndex < quiz.questions.length - 1 ? (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            ) : (
              'Submit Quiz'
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {quiz.questions.map((question, index) => {
          const questId = question.id || (question as { _id?: string | object })._id?.toString();
          const isQuestAnswered = !!(questId && selectedOptions[questId]);
          const isCurrent = index === currentQuestionIndex;
          
          return (
            <Button
              key={index}
              variant={isCurrent ? "default" : "outline"}
              size="icon"
              className={`h-10 w-10 rounded-full ${
                isQuestAnswered 
                  ? "text-green-600 border-green-600" 
                  : ""
              }`}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              {isQuestAnswered ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </Button>
          );
        })}
      </div>
      
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              {Object.keys(selectedOptions).length < quiz.questions.length ? (
                <>
                  <div className="text-amber-500 flex items-center gap-2 mb-2">
                    <XCircle className="h-5 w-5" />
                    <span>You have not answered all questions.</span>
                  </div>
                  <p>
                    You've answered {Object.keys(selectedOptions).length} out of {quiz.questions.length} questions.
                    Unanswered questions will be marked as incorrect.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-green-600 flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>All questions answered!</span>
                  </div>
                  <p>Are you sure you want to submit your answers?</p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Quiz</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit}>
              Submit Quiz
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuizTaking;
