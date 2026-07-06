import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Search, Eye, CheckCircle2, XCircle, Calendar, Award } from "lucide-react";
import { Quiz, StudentAttemptInfo } from "@/types";
import { getAdminStudentAttempts } from "@/services/quizService";

interface StudentAttemptsListProps {
  quizzes: Quiz[];
}

interface GroupedStudentAttempt {
  key: string; // `${userId}_${quizId}`
  userId: string;
  quizId: string;
  studentEmail: string;
  quizTitle: string;
  attemptsCount: number;
  highestScore: number;
  totalQuestions: number;
  latestAttemptDate: Date | string;
  attempts: StudentAttemptInfo[];
}

const StudentAttemptsList: React.FC<StudentAttemptsListProps> = ({ quizzes }) => {
  const [attempts, setAttempts] = useState<StudentAttemptInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [quizFilter, setQuizFilter] = useState("all");
  
  // Group state for the Details modal
  const [selectedGroup, setSelectedGroup] = useState<GroupedStudentAttempt | null>(null);
  const [activeAttemptIndex, setActiveAttemptIndex] = useState(0);
  
  const { toast } = useToast();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const data = await getAdminStudentAttempts();
        setAttempts(data);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching student attempts",
          description: "Could not load attempts data. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, [toast]);

  // Group attempts by student (userId) and quiz (quizId)
  const getGroupedAttempts = (): GroupedStudentAttempt[] => {
    const grouped: { [key: string]: GroupedStudentAttempt } = {};

    attempts.forEach((attempt) => {
      const key = `${attempt.userId}_${attempt.quizId}`;
      if (!grouped[key]) {
        grouped[key] = {
          key,
          userId: attempt.userId,
          quizId: attempt.quizId,
          studentEmail: attempt.studentEmail || "Unknown Student",
          quizTitle: attempt.quizTitle || "Deleted Quiz",
          attemptsCount: 0,
          highestScore: 0,
          totalQuestions: attempt.totalQuestions,
          latestAttemptDate: attempt.attemptDate,
          attempts: [],
        };
      }

      const group = grouped[key];
      group.attempts.push(attempt);
      group.attemptsCount++;

      if (attempt.score > group.highestScore) {
        group.highestScore = attempt.score;
      }

      const currentLatest = new Date(group.latestAttemptDate).getTime();
      const attemptTime = new Date(attempt.attemptDate).getTime();
      if (attemptTime > currentLatest) {
        group.latestAttemptDate = attempt.attemptDate;
      }
    });

    // Sort attempts in each group by date descending (latest attempt first)
    return Object.values(grouped).map((group) => {
      group.attempts.sort(
        (a, b) => new Date(b.attemptDate).getTime() - new Date(a.attemptDate).getTime()
      );
      return group;
    });
  };

  const groupedAttemptsList = getGroupedAttempts();

  const filteredGroups = groupedAttemptsList.filter((group) => {
    const matchesSearch = group.studentEmail
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesQuiz = quizFilter === "all" ? true : group.quizId === quizFilter;
    return matchesSearch && matchesQuiz;
  });

  const getQuizDetailsForAttempt = (quizId: string) => {
    return quizzes.find((q) => q.id === quizId);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleOpenDetails = (group: GroupedStudentAttempt) => {
    setSelectedGroup(group);
    setActiveAttemptIndex(0); // Default to the latest attempt
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Find the selected quiz details to map answers
  const selectedAttemptQuiz = selectedGroup ? getQuizDetailsForAttempt(selectedGroup.quizId) : null;
  const currentAttempt = selectedGroup ? selectedGroup.attempts[activeAttemptIndex] : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Attempts</CardTitle>
          <CardDescription>
            View student performance, scores, and details for quizzes you've created
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search student email..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={quizFilter} onValueChange={setQuizFilter}>
              <SelectTrigger className="w-full md:w-[240px]">
                <SelectValue placeholder="All Quizzes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quizzes</SelectItem>
                {quizzes.map((quiz) => (
                  <SelectItem key={quiz.id} value={quiz.id}>
                    {quiz.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredGroups.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No attempts found matching the filters</p>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Email</TableHead>
                    <TableHead>Quiz Name</TableHead>
                    <TableHead className="text-center">Attempts</TableHead>
                    <TableHead className="text-center">Highest Score</TableHead>
                    <TableHead className="text-center">Highest Percentage</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map((group) => {
                    const percentage = Math.round((group.highestScore / group.totalQuestions) * 100);
                    return (
                      <TableRow key={group.key}>
                        <TableCell className="font-medium">
                          {group.studentEmail}
                        </TableCell>
                        <TableCell>{group.quizTitle}</TableCell>
                        <TableCell className="text-center font-semibold">
                          {group.attemptsCount}
                        </TableCell>
                        <TableCell className="text-center">
                          {group.highestScore} / {group.totalQuestions}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={percentage >= 70 ? "default" : percentage >= 40 ? "secondary" : "destructive"}>
                            {percentage}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(group.latestAttemptDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetails(group)}
                            className="flex items-center gap-1 ml-auto"
                          >
                            <Eye className="h-4 w-4" />
                            Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedGroup && currentAttempt && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  Student Attempt Details
                </DialogTitle>
                <DialogDescription className="space-y-1 mt-1">
                  <div>Student: <span className="font-medium text-foreground">{selectedGroup.studentEmail}</span></div>
                  <div>Quiz: <span className="font-medium text-foreground">{selectedGroup.quizTitle}</span></div>
                  <div>Total Attempts: <span className="font-semibold text-foreground">{selectedGroup.attemptsCount}</span></div>
                </DialogDescription>
              </DialogHeader>

              {/* Selector to switch between different attempts */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-lg border mt-4">
                <div className="w-full sm:w-auto">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Select Attempt
                  </label>
                  <Select
                    value={activeAttemptIndex.toString()}
                    onValueChange={(val) => setActiveAttemptIndex(parseInt(val))}
                  >
                    <SelectTrigger className="w-full sm:w-[260px] bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedGroup.attempts.map((att, idx) => {
                        const scorePct = Math.round((att.score / att.totalQuestions) * 100);
                        return (
                          <SelectItem key={att._id} value={idx.toString()}>
                            Attempt #{selectedGroup.attempts.length - idx} — {scorePct}% ({att.score}/{att.totalQuestions})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium uppercase">Attempt Score</span>
                    <span className="font-semibold text-base mt-0.5">
                      {currentAttempt.score} / {currentAttempt.totalQuestions} ({Math.round((currentAttempt.score / currentAttempt.totalQuestions) * 100)}%)
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-medium uppercase">Date Taken</span>
                    <span className="font-medium text-slate-700 flex items-center gap-1 mt-1">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatDate(currentAttempt.attemptDate)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mt-6">
                <h3 className="font-semibold text-lg border-b pb-2">
                  Attempt #{selectedGroup.attempts.length - activeAttemptIndex} Breakdown
                </h3>
                {selectedAttemptQuiz ? (
                  selectedAttemptQuiz.questions.map((question, index) => {
                    const studentAnswer = currentAttempt.answers.find(
                      (ans) => ans.questionId === question.id
                    );
                    const isCorrect = studentAnswer ? studentAnswer.isCorrect : false;
                    const selectedOptId = studentAnswer ? studentAnswer.selectedAnswer : null;

                    return (
                      <div
                        key={question.id || index}
                        className={`p-4 border rounded-lg bg-card shadow-sm ${
                          isCorrect ? "border-green-200 bg-green-50/20" : "border-red-200 bg-red-50/10"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <p className="font-medium">
                            {index + 1}. {question.text}
                          </p>
                          {isCorrect ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Correct
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="flex items-center gap-1">
                              <XCircle className="h-3.5 w-3.5" /> Incorrect
                            </Badge>
                          )}
                        </div>

                        <div className="space-y-2 pl-4">
                          {question.options.map((option) => {
                            const isCorrectOption = question.correctOptionId === option.id;
                            const isSelectedOption = selectedOptId === option.id;

                            let optClass = "p-2 rounded-md border text-sm flex items-center ";
                            if (isCorrectOption) {
                              optClass += "bg-green-50 border-green-300 text-green-950 font-medium";
                            } else if (isSelectedOption) {
                              optClass += "bg-red-50 border-red-300 text-red-950 font-medium";
                            } else {
                              optClass += "border-slate-100 bg-slate-50/50 text-slate-700";
                            }

                            return (
                              <div key={option.id} className={optClass}>
                                <div
                                  className={`h-4 w-4 rounded-full border mr-3 flex items-center justify-center ${
                                    isCorrectOption
                                      ? "border-green-500 bg-green-500 text-white"
                                      : isSelectedOption
                                      ? "border-red-500 bg-red-500 text-white"
                                      : "border-slate-300"
                                  }`}
                                >
                                  {isCorrectOption && <CheckCircle2 className="h-3 w-3" />}
                                  {!isCorrectOption && isSelectedOption && <XCircle className="h-3 w-3" />}
                                </div>
                                <span className="flex-1">{option.text}</span>
                                {isCorrectOption && (
                                  <span className="text-xs text-green-600 font-semibold uppercase tracking-wider ml-2">
                                    Correct Answer
                                  </span>
                                )}
                                {isSelectedOption && !isCorrectOption && (
                                  <span className="text-xs text-red-600 font-semibold uppercase tracking-wider ml-2">
                                    Selected
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Detailed breakdown not available. The quiz configuration has been updated or removed.
                  </p>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentAttemptsList;
