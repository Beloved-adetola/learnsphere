
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
import { ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
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
  
  // Organization Code Gateway
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [orgCode, setOrgCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Initial load is just finishing "loading" state since we defer fetching until code entry
  useEffect(() => {
    setLoading(false);
  }, []);
  
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizId || !orgCode.trim()) return;
    
    setIsVerifying(true);
    try {
      const quizData = await getQuizById(quizId, orgCode);
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
    } catch (error) {
      if (error instanceof Error && error.message === 'invalid_code') {
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'Invalid or missing organization code for this quiz.',
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
  
  const handleOptionSelect = (questionId: string, optionId: string) => {
    if (!questionId) {
      console.error("QuizTaking: Cannot select option, questionId is missing");
      return;
    }
    console.log(`QuizTaking: Selecting option ${optionId} for question ${questionId}`);
    setSelectedOptions(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };
  
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
  
  const handleSubmit = async () => {
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
  };
  
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
            <CardTitle className="text-2xl">Quiz Locked</CardTitle>
            <CardDescription>
              This is a private quiz. Enter the organization code provided by your instructor to access it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form id="verify-code-form" onSubmit={handleVerifyCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgCode">Organization Code</Label>
                <div className="flex gap-2">
                  <input
                    id="orgCode"
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter code (e.g. MATH101)"
                    value={orgCode}
                    onChange={(e) => setOrgCode(e.target.value)}
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
              disabled={isVerifying || !orgCode.trim()}
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
