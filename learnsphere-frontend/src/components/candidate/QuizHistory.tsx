
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { ArrowRight, ClipboardList, ChevronDown, ChevronUp, BarChart } from 'lucide-react';
import { Quiz, QuizAttempt } from '@/types';

interface QuizHistoryProps {
  attempts: QuizAttempt[];
  quizzes: Quiz[];
  loading: boolean;
}

const QuizHistory: React.FC<QuizHistoryProps> = ({ attempts, quizzes, loading }) => {
  const navigate = useNavigate();
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  
  // Group attempts by quizId
  const groupedAttempts = attempts.reduce((acc, attempt) => {
    if (!acc[attempt.quizId]) {
      acc[attempt.quizId] = [];
    }
    acc[attempt.quizId].push(attempt);
    return acc;
  }, {} as Record<string, QuizAttempt[]>);

  // Helper function to get quiz info
  const getQuizInfo = (quizId: string, fallbackQuiz?: any) => {
    const found = quizzes.find(q => (q.id === quizId || (q as any)._id === quizId));
    return found || fallbackQuiz;
  };

  // Calculate stats for a group
  const getGroupStats = (quizAttempts: QuizAttempt[]) => {
    const totalScore = quizAttempts.reduce((sum, a) => sum + (a.score / a.totalQuestions), 0);
    const averagePercentage = Math.round((totalScore / quizAttempts.length) * 100);
    return {
      averagePercentage,
      count: quizAttempts.length
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (attempts.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/20">
        <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground/30" />
        <h3 className="mt-4 text-lg font-semibold">No quiz history</h3>
        <p className="text-muted-foreground mb-6">
          You haven't completed any quizzes yet.
        </p>
        <Button onClick={() => navigate('/candidate/dashboard')}>
          Explore Quizzes
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
        <BarChart className="h-4 w-4" />
        <span>Your performance grouped by course/quiz</span>
      </div>

      {Object.entries(groupedAttempts).map(([quizId, quizAttempts]) => {
        const quiz = getQuizInfo(quizId, quizAttempts[0]?.quiz);
        const { averagePercentage, count } = getGroupStats(quizAttempts);
        const isExpanded = expandedQuizId === quizId;
        
        // Sort individual attempts by date
        const sortedSubAttempts = [...quizAttempts].sort(
          (a, b) => {
            const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
            const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
            return dateB - dateA;
          }
        );

        return (
          <Card key={quizId} className="overflow-hidden border-l-4 border-l-primary">
            <div 
              className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedQuizId(isExpanded ? null : quizId)}
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{quiz?.title || 'Unknown Quiz'}</CardTitle>
                  <CardDescription>
                    {quiz?.category} • {count} attempt{count !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Avg. Score</p>
                    <p className={`text-xl font-bold ${averagePercentage >= 70 ? 'text-green-600' : 'text-primary'}`}>
                      {averagePercentage}%
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </div>
              <div className="mt-3">
                <Progress value={averagePercentage} className="h-1.5" />
              </div>
            </div>

            {isExpanded && (
              <CardContent className="pt-0 pb-4 px-4 bg-muted/10">
                <div className="mt-4 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Attempt Details</p>
                  {sortedSubAttempts.map((attempt, index) => {
                    const perc = Math.round((attempt.score / attempt.totalQuestions) * 100);
                    return (
                      <div key={attempt.id} className="flex items-center justify-between p-3 rounded-md bg-background border text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium text-muted-foreground">
                            Attempt {count - index}
                          </span>
                          <span className="text-xs">
                            {attempt.completedAt && !isNaN(new Date(attempt.completedAt).getTime())
                              ? format(new Date(attempt.completedAt), 'MMM dd, yyyy • HH:mm')
                              : 'Date unknown'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-bold ${perc >= 70 ? 'text-green-600' : ''}`}>
                            {attempt.score}/{attempt.totalQuestions} ({perc}%)
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/candidate/quiz/${quizId}`);
                            }}
                          >
                            Retake
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default QuizHistory;
