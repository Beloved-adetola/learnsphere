
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, CheckCircle } from 'lucide-react';
import { Quiz } from '@/types';
import { QUIZ_CATEGORIES } from '@/services/quizService';

interface QuizCatalogProps {
  quizzes: Quiz[];
  loading: boolean;
  attemptedQuizIds: string[];
}

const QuizCatalog: React.FC<QuizCatalogProps> = ({ quizzes, loading, attemptedQuizIds }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const navigate = useNavigate();

  const filteredQuizzes = quizzes.filter(quiz => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch = 
      (quiz.title || "").toLowerCase().includes(searchStr) ||
      (quiz.description || "").toLowerCase().includes(searchStr) ||
      (quiz.category || "").toLowerCase().includes(searchStr);
      
    const matchesCategory = categoryFilter === 'all' ? true : quiz.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  console.log("Rendering QuizCatalog with", quizzes.length, "total and", filteredQuizzes.length, "filtered quizzes");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quizzes..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select 
          value={categoryFilter} 
          onValueChange={setCategoryFilter}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {QUIZ_CATEGORIES.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No quizzes found</h3>
          <p className="text-muted-foreground">
            {categoryFilter !== 'all'
              ? `No quizzes available in the ${categoryFilter} category.`
              : 'No quizzes match your search criteria.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map(quiz => {
            const hasAttempted = attemptedQuizIds.includes(quiz.id);
            
            return (
              <Card key={quiz.id} className="group overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge variant="outline">{quiz.category}</Badge>
                    {hasAttempted && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Attempted
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-2">{quiz.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full group-hover:bg-primary/90 transition-colors"
                    onClick={() => navigate(`/candidate/quiz/${quiz.id}`)}
                  >
                    {hasAttempted ? 'Take Again' : 'Start Quiz'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QuizCatalog;
