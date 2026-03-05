import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Plus, FilePlus, List, BarChart } from "lucide-react";
import { Auth } from "@/config/firebase";
import { Quiz, Question } from "@/types";
import { getQuizzes } from "@/services/quizService";
import AdminQuizList from "./AdminQuizList";
import CreateQuizForm from "./CreateQuizForm";
import { useNavigate } from "react-router-dom";

const AdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [organizationCode, setOrganizationCode] = useState("");
  const [isSavingCode, setIsSavingCode] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const idToken = await Auth.currentUser?.getIdToken();
        const [data, profileRes] = await Promise.all([
          getQuizzes(),
          fetch("http://localhost:5000/api/user/profile", {
            headers: {
              "Authorization": `Bearer ${idToken}`
            }
          }).then(res => res.json())
        ]);
        
        // Filter quizzes created by the current admin
        const adminQuizzes = data.filter(
          (quiz) => quiz.createdBy === currentUser?.id
        );
        setQuizzes(adminQuizzes);
        
        if (profileRes.organizationCode !== undefined) {
          setOrganizationCode(profileRes.organizationCode);
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching dashboard data",
          description: "Could not load your data. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser, toast]);

  const handleQuizCreated = (newQuiz: Quiz) => {
    setQuizzes((prev) => [newQuiz, ...prev]);
    setActiveTab("quizzes");
    toast({
      title: "Quiz Created",
      description: "Your quiz has been created successfully!",
    });
  };

  const handleQuizDeleted = (quizId: string) => {
    setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
    toast({
      title: "Quiz Deleted",
      description: "Your quiz has been deleted successfully!",
    });
  };

  const handleQuizUpdated = (updatedQuiz: Quiz) => {
    setQuizzes((prev) =>
      prev.map((quiz) => (quiz.id === updatedQuiz.id ? updatedQuiz : quiz))
    );
    toast({
      title: "Quiz Updated",
      description: "Your quiz has been updated successfully!",
    });
  };

  const handleEditQuiz = (quiz: Quiz) => {
    setEditingQuiz(quiz);
    setActiveTab("edit");
  };

  const handleEditQuizSubmit = (updatedQuiz: Quiz) => {
    handleQuizUpdated(updatedQuiz);
    setEditingQuiz(null);
    setActiveTab("quizzes");
  };

  const handleCreateTabClick = () => {
    setEditingQuiz(null);
    setActiveTab("create");
  };

  const handleSaveOrganizationCode = async () => {
    if (!organizationCode.trim()) {
      toast({
        variant: "destructive",
        title: "Code required",
        description: "Please enter an organization code.",
      });
      return;
    }
    
    setIsSavingCode(true);
    try {
      const idToken = await Auth.currentUser?.getIdToken();
      const res = await fetch("http://localhost:5000/api/user/profile/code", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({ code: organizationCode })
      });
      
      if (!res.ok) throw new Error("Failed to save code");
      
      toast({
        title: "Success",
        description: "Organization code updated successfully.",
      });
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update organization code.",
      });
    } finally {
      setIsSavingCode(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button
          onClick={handleCreateTabClick}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          New Quiz
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-3xl">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart size={16} />
            Overview
          </TabsTrigger>
          <TabsTrigger value="quizzes" className="flex items-center gap-2" onClick={() => setActiveTab("quizzes")}>
            <List size={16} />
            My Quizzes
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2" onClick={handleCreateTabClick}>
            <FilePlus size={16} />
            Create Quiz
          </TabsTrigger>
          {editingQuiz && (
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <Plus size={16} />
              Edit Quiz
            </TabsTrigger>
          )}
          <TabsTrigger value="manage" className="flex items-center gap-2" onClick={() => setActiveTab("manage")}>
            <BarChart size={16} />
            Manage Admin Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Quizzes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{quizzes.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Published Quizzes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {quizzes.filter((q) => q.isPublished).length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {quizzes.reduce(
                    (total, quiz) => total + quiz.questions.length,
                    0
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {quizzes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No quiz activity yet</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab("create")}
                  >
                    Create Your First Quiz
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizzes.slice(0, 5).map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex justify-between items-center p-4 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{quiz.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {quiz.questions.length} questions • {quiz.category}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditQuiz(quiz)}
                      >
                        Edit
                      </Button>
                      {/* Legacy edit removed */}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="mt-6">
          <AdminQuizList
            quizzes={quizzes}
            loading={loading}
            onQuizDeleted={handleQuizDeleted}
            onQuizUpdated={handleQuizUpdated}
            onEditQuiz={handleEditQuiz}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <CreateQuizForm onQuizCreated={handleQuizCreated} />
        </TabsContent>
        
        {editingQuiz && (
          <TabsContent value="edit" className="mt-6">
            <CreateQuizForm 
              initialData={editingQuiz} 
              isEdit={true} 
              onQuizUpdated={handleEditQuizSubmit} 
            />
          </TabsContent>
        )}
        
        <TabsContent value="manage" className="mt-6">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Manage Admin Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">Organization Privacy Code</label>
                <p className="text-sm text-muted-foreground pb-2">
                  Set a unique password code that candidates must enter before they can access quizzes generated by this account.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter new code (e.g. CS101-FALL)"
                    value={organizationCode}
                    onChange={(e) => setOrganizationCode(e.target.value)}
                  />
                  <Button onClick={handleSaveOrganizationCode} disabled={isSavingCode || !organizationCode.trim()}>
                    {isSavingCode ? "Saving..." : "Save Code"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
