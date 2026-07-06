
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Eye, Edit, Trash2, MoreVertical, Search, CheckCircle2 } from 'lucide-react';
import { Quiz, QuizCategory } from '@/types';
import { QUIZ_CATEGORIES, deleteQuiz, updateQuiz } from '@/services/quizService';

interface AdminQuizListProps {
  quizzes: Quiz[];
  loading: boolean;
  onQuizDeleted: (quizId: string) => void;
  onQuizUpdated: (quiz: Quiz) => void;
  onEditQuiz: (quiz: Quiz) => void;
}

const AdminQuizList: React.FC<AdminQuizListProps> = ({ 
  quizzes, 
  loading, 
  onQuizDeleted,
  onQuizUpdated,
  onEditQuiz
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);
  const [quizToPreview, setQuizToPreview] = useState<Quiz | null>(null);
  const [isPublishing, setIsPublishing] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDeleteQuiz = async () => {
    if (!quizToDelete) return;
    
    try {
      await deleteQuiz(quizToDelete);
      onQuizDeleted(quizToDelete);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete quiz. Please try again.',
      });
    } finally {
      setQuizToDelete(null);
    }
  };

  const handleTogglePublish = async (quiz: Quiz) => {
    setIsPublishing(quiz.id);
    try {
      const updatedQuiz = await updateQuiz(quiz.id, { 
        isPublished: !quiz.isPublished 
      });
      onQuizUpdated(updatedQuiz);
      toast({
        title: updatedQuiz.isPublished ? 'Quiz Published' : 'Quiz Unpublished',
        description: updatedQuiz.isPublished 
          ? 'Your quiz is now available to candidates' 
          : 'Your quiz is now hidden from candidates',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update quiz status. Please try again.',
      });
    } finally {
      setIsPublishing(null);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' ? true : quiz.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Quizzes</CardTitle>
          <CardDescription>Manage all the quizzes you've created</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
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
            <div className="text-center py-8">
              <p className="text-muted-foreground">No quizzes found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuizzes.map(quiz => (
                <div 
                  key={quiz.id} 
                  className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg"
                >
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{quiz.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        quiz.isPublished 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {quiz.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {quiz.questions.length} questions • {quiz.category}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => setQuizToPreview(quiz)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="hidden md:inline">Preview</span>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => onEditQuiz(quiz)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="hidden md:inline">Edit</span>
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleTogglePublish(quiz)}
                          disabled={isPublishing === quiz.id}
                        >
                          {isPublishing === quiz.id
                            ? 'Updating...'
                            : quiz.isPublished
                            ? 'Unpublish Quiz'
                            : 'Publish Quiz'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setQuizToDelete(quiz.id)}
                        >
                          Delete Quiz
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!quizToDelete} onOpenChange={(open) => !open && setQuizToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the quiz and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuiz} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!quizToPreview} onOpenChange={(open) => !open && setQuizToPreview(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {quizToPreview && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{quizToPreview.title}</DialogTitle>
                <DialogDescription>
                  Category: {quizToPreview.category}
                </DialogDescription>
              </DialogHeader>
              
              {quizToPreview.description && (
                <div className="text-sm text-foreground bg-slate-50 p-4 rounded-md">
                  {quizToPreview.description}
                </div>
              )}
              
              <div className="space-y-6 mt-4">
                <h3 className="font-semibold text-lg border-b pb-2">Questions Preview</h3>
                {quizToPreview.questions.map((question, qIndex) => (
                  <div key={question.id || qIndex} className="p-4 border rounded-lg bg-card shadow-sm">
                    <p className="font-medium mb-3">
                      {qIndex + 1}. {question.text}
                    </p>
                    <div className="space-y-2 pl-4">
                      {question.options.map((option) => (
                        <div 
                          key={option.id} 
                          className={`flex items-center p-2 rounded-md ${
                            question.correctOptionId === option.id 
                              ? 'bg-green-50 border border-green-200' 
                              : ''
                          }`}
                        >
                          <div className={`h-4 w-4 rounded-full border mr-3 flex items-center justify-center ${
                            question.correctOptionId === option.id 
                              ? 'border-green-500 bg-green-500 text-white' 
                              : 'border-slate-300'
                          }`}>
                            {question.correctOptionId === option.id && <CheckCircle2 className="h-3 w-3" />}
                          </div>
                          <span className={question.correctOptionId === option.id ? 'font-medium text-green-900' : ''}>
                            {option.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminQuizList;
