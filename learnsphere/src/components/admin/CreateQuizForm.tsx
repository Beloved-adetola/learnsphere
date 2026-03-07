
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Plus } from 'lucide-react';
import { Quiz, Question, Option, QuizCategory } from '@/types';
import { QUIZ_CATEGORIES, createQuiz, updateQuiz } from '@/services/quizService';
import { useAuth } from '@/context/AuthContext';

interface CreateQuizFormProps {
  onQuizCreated?: (quiz: Quiz) => void;
  onQuizUpdated?: (quiz: Quiz) => void;
  initialData?: Quiz;
  isEdit?: boolean;
}

const CreateQuizForm: React.FC<CreateQuizFormProps> = ({ 
  onQuizCreated, 
  onQuizUpdated, 
  initialData, 
  isEdit = false 
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Quiz details state
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState<QuizCategory>((initialData?.category as QuizCategory) || 'Programming');
  const [isPublished, setIsPublished] = useState(initialData?.isPublished || false);
  const [maxAttempts, setMaxAttempts] = useState(initialData?.maxAttempts || 0);
  const [password, setPassword] = useState(initialData?.password || '');
  
  // Time limit state (stored as minutes in DB, split into H/M in UI)
  const [timeLimitHours, setTimeLimitHours] = useState(initialData?.timeLimit ? Math.floor(initialData.timeLimit / 60) : 0);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(initialData?.timeLimit ? initialData.timeLimit % 60 : 0);
  
  // Questions state
  const [questions, setQuestions] = useState<Omit<Question, 'id'>[]>(
    initialData?.questions && initialData.questions.length > 0
      ? initialData.questions.map(q => ({
          text: q.text,
          options: q.options.map(opt => ({ ...opt })),
          correctOptionId: q.correctOptionId
        }))
      : [
          {
            text: '',
            options: [
              { id: '1', text: '' },
              { id: '2', text: '' },
              { id: '3', text: '' },
              { id: '4', text: '' },
            ],
            correctOptionId: '1',
          },
        ]
  );

  React.useEffect(() => {
    if (isEdit && initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCategory((initialData.category as QuizCategory) || 'Programming');
      setIsPublished(initialData.isPublished || false);
      setMaxAttempts(initialData.maxAttempts || 0);
      setPassword(initialData.password || '');
      setTimeLimitHours(initialData.timeLimit ? Math.floor(initialData.timeLimit / 60) : 0);
      setTimeLimitMinutes(initialData.timeLimit ? initialData.timeLimit % 60 : 0);
      
      if (initialData.questions && initialData.questions.length > 0) {
        setQuestions(
          initialData.questions.map(q => ({
            text: q.text,
            options: q.options.map(opt => ({ ...opt })),
            correctOptionId: q.correctOptionId
          }))
        );
      }
    } else if (!isEdit) {
      // Reset form if switching out of edit mode
      setTitle('');
      setDescription('');
      setCategory('Programming');
      setIsPublished(false);
      setMaxAttempts(0);
      setTimeLimitHours(0);
      setTimeLimitMinutes(0);
      setQuestions([{
        text: '',
        options: [
          { id: '1', text: '' },
          { id: '2', text: '' },
          { id: '3', text: '' },
          { id: '4', text: '' },
        ],
        correctOptionId: '1',
      }]);
    }
  }, [isEdit, initialData]);

  const handleAddQuestion = () => {
    setQuestions(prev => [
      ...prev,
      {
        text: '',
        options: [
          { id: `q${prev.length + 1}-1`, text: '' },
          { id: `q${prev.length + 1}-2`, text: '' },
          { id: `q${prev.length + 1}-3`, text: '' },
          { id: `q${prev.length + 1}-4`, text: '' },
        ],
        correctOptionId: `q${prev.length + 1}-1`,
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index: number, text: string) => {
    setQuestions(prev => 
      prev.map((q, i) => 
        i === index ? { ...q, text } : q
      )
    );
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, text: string) => {
    setQuestions(prev => 
      prev.map((q, qIndex) => 
        qIndex === questionIndex 
          ? {
              ...q,
              options: q.options.map((opt, oIndex) => 
                oIndex === optionIndex ? { ...opt, text } : opt
              ),
            }
          : q
      )
    );
  };

  const handleCorrectAnswerChange = (questionIndex: number, optionId: string) => {
    setQuestions(prev => 
      prev.map((q, qIndex) => 
        qIndex === questionIndex ? { ...q, correctOptionId: optionId } : q
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!title.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing title',
        description: 'Please enter a title for your quiz',
      });
      setActiveTab('details');
      return;
    }
    
    if (!category) {
      toast({
        variant: 'destructive',
        title: 'Missing category',
        description: 'Please select a category for your quiz',
      });
      setActiveTab('details');
      return;
    }
    
    // Validate questions
    const invalidQuestionIndex = questions.findIndex(q => !q.text.trim());
    if (invalidQuestionIndex !== -1) {
      toast({
        variant: 'destructive',
        title: 'Missing question',
        description: `Question ${invalidQuestionIndex + 1} is empty`,
      });
      setActiveTab('questions');
      return;
    }
    
    // Validate options
    for (let qIndex = 0; qIndex < questions.length; qIndex++) {
      const question = questions[qIndex];
      for (let oIndex = 0; oIndex < question.options.length; oIndex++) {
        if (!question.options[oIndex].text.trim()) {
          toast({
            variant: 'destructive',
            title: 'Missing option',
            description: `Option ${oIndex + 1} in question ${qIndex + 1} is empty`,
          });
          setActiveTab('questions');
          return;
        }
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare quiz data
      const quizData: Omit<Quiz, 'id' | 'createdAt'> = {
        title,
        description,
        category,
        isPublished,
        maxAttempts,
        password,
        timeLimit: (timeLimitHours * 60) + timeLimitMinutes,
        questions: questions.map((q, qIndex) => ({
          id: `q${qIndex + 1}`,
          text: q.text,
          options: q.options,
          correctOptionId: q.correctOptionId,
        })),
        createdBy: currentUser?.id || '',
        updatedAt: new Date(),
      };
      
      if (isEdit && initialData) {
        // Update quiz
        const updatedQuiz = await updateQuiz(initialData.id, quizData);
        if (onQuizUpdated) {
          onQuizUpdated(updatedQuiz);
        }
        toast({
          title: 'Quiz Updated',
          description: 'Quiz successfully updated.',
        });
      } else {
        // Create quiz
        const newQuiz = await createQuiz(quizData);
        if (onQuizCreated) {
          onQuizCreated(newQuiz);
        }
        toast({
          title: 'Quiz Created',
          description: 'Quiz successfully created.',
        });
        
        // Only reset form if creating
        setTitle('');
        setDescription('');
        setCategory('Programming');
        setIsPublished(false);
        setMaxAttempts(0);
        setPassword('');
        setTimeLimitHours(0);
        setTimeLimitMinutes(0);
        setQuestions([
          {
            text: '',
            options: [
              { id: '1', text: '' },
              { id: '2', text: '' },
              { id: '3', text: '' },
              { id: '4', text: '' },
            ],
            correctOptionId: '1',
          },
        ]);
      }
      
      
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error creating quiz',
        description: 'Failed to create quiz. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Edit Quiz' : 'Create New Quiz'}</CardTitle>
          <CardDescription>
            {isEdit ? 'Update the details and questions of your quiz' : 'Create a new quiz for candidates to take'}
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardContent>
            <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
              <TabsTrigger value="details">Quiz Details</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  placeholder="Enter quiz title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter a description for your quiz"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={category} 
                  onValueChange={(value) => setCategory(value as QuizCategory)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {QUIZ_CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="published">Publish immediately</Label>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="maxAttempts">Maximum Attempts (0 for unlimited)</Label>
                <Input
                  id="maxAttempts"
                  type="number"
                  min="0"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(parseInt(e.target.value) || 0)}
                />
              </div>

              <div className="space-y-2 pt-2">
                <Label>Time Limit</Label>
                <div className="flex gap-4 items-end">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="hours" className="text-xs text-muted-foreground">Hours</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      value={timeLimitHours}
                      onChange={(e) => setTimeLimitHours(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="minutes" className="text-xs text-muted-foreground">Minutes</Label>
                    <Input
                      id="minutes"
                      type="number"
                      min="0"
                      max="59"
                      value={timeLimitMinutes}
                      onChange={(e) => setTimeLimitMinutes(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Leave as 0 for no time limit
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Label htmlFor="quizPassword">Quiz Password</Label>
                <Input
                  id="quizPassword"
                  type="text"
                  placeholder="Set a password for this quiz"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Students must enter this password to start the quiz.
                </p>
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full mt-4"
                onClick={() => setActiveTab('questions')}
              >
                Next: Add Questions
              </Button>
            </TabsContent>
            
            <TabsContent value="questions" className="space-y-6">
              {questions.map((question, qIndex) => (
                <Card key={qIndex} className="relative">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex justify-between items-center">
                      <span>Question {qIndex + 1}</span>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleRemoveQuestion(qIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={`question-${qIndex}`}>Question Text</Label>
                      <Textarea
                        id={`question-${qIndex}`}
                        placeholder="Enter your question"
                        value={question.text}
                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                        rows={2}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <Label>Options</Label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <div className="flex-shrink-0">
                            <input
                              type="radio"
                              id={`q${qIndex}-option-${oIndex}`}
                              name={`q${qIndex}-correct`}
                              value={option.id}
                              checked={question.correctOptionId === option.id}
                              onChange={() => handleCorrectAnswerChange(qIndex, option.id)}
                              className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                            />
                          </div>
                          <Input
                            placeholder={`Option ${oIndex + 1}`}
                            value={option.text}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                          />
                        </div>
                      ))}
                      <p className="text-xs text-muted-foreground">
                        Select the radio button next to the correct answer
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleAddQuestion}
              >
                <Plus className="h-4 w-4" />
                Add Another Question
              </Button>
              
              <div className="flex justify-between mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveTab('details')}
                >
                  Back to Details
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting 
                    ? (isEdit ? 'Updating Quiz...' : 'Creating Quiz...') 
                    : (isEdit ? 'Update Quiz' : 'Create Quiz')}
                </Button>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <p className="text-sm text-muted-foreground">
            {questions.length} question{questions.length !== 1 ? 's' : ''} in this quiz
          </p>
        </CardFooter>
      </Card>
    </form>
  );
};

export default CreateQuizForm;
