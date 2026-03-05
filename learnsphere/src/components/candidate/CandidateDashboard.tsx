
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Search, BookOpen, ClipboardList } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Quiz, QuizAttempt } from '@/types';
import { getAvailableQuizzes, getQuizAttemptsByUser } from '@/services/quizService';
import QuizCatalog from './QuizCatalog';
import QuizHistory from './QuizHistory';

const CandidateDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch quizzes and user's attempts in parallel
        const [quizzesData, attemptsData] = await Promise.all([
          getAvailableQuizzes(),
          currentUser ? getQuizAttemptsByUser(currentUser.id) : Promise.resolve([]),
        ]);
        
        // Only show published quizzes to candidates
        setQuizzes(quizzesData.filter(quiz => quiz.isPublished));
        setAttempts(attemptsData);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching data',
          description: 'Could not load quizzes or history. Please try again later.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, toast]);

  const totalQuizzesTaken = attempts.length;
  const averageScore = attempts.length > 0
    ? Math.round(
        attempts.reduce((sum, attempt) => 
          sum + (attempt.score / attempt.totalQuestions) * 100, 0
        ) / attempts.length
      )
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Candidate Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{currentUser?.name ? ', ' + currentUser.name : ''}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{quizzes.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Quizzes Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalQuizzesTaken}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalQuizzesTaken > 0 ? `${averageScore}%` : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="quizzes">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="quizzes" className="flex items-center gap-2">
            <BookOpen size={16} />
            Available Quizzes
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <ClipboardList size={16} />
            Quiz History
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="quizzes" className="mt-6">
          <QuizCatalog 
            quizzes={quizzes} 
            loading={loading} 
            attemptedQuizIds={attempts.map(a => a.quizId)}
          />
        </TabsContent>
        
        <TabsContent value="history" className="mt-6">
          <QuizHistory 
            attempts={attempts} 
            quizzes={quizzes} 
            loading={loading} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CandidateDashboard;
