import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { PlusCircle, Users, BookOpen } from "lucide-react";
import type { Quiz, QuizAttempt } from "@shared/schema";

export default function TeacherDashboard() {
  const { user } = useAuth();
  
  const { data: quizzes, isLoading: loadingQuizzes } = useQuery<Quiz[]>({
    queryKey: ["/api/teacher/quizzes"],
    enabled: user?.role === "teacher"
  });

  if (loadingQuizzes) {
    return <div className="container mx-auto p-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Teacher Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage your quizzes and view student progress</p>
        </div>
        <Link to="/create-quiz">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create New Quiz
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {quizzes?.map((quiz) => (
          <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                {quiz.title}
              </CardTitle>
              <CardDescription>{quiz.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Users className="h-4 w-4" />
                {Math.floor(quiz.timeLimit / 60)} minutes
              </div>
              <Link to={`/quiz-responses/${quiz.id}`}>
                <Button variant="outline" className="w-full">View Responses</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {quizzes?.length === 0 && (
        <Card className="bg-muted">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-background p-3 mb-4">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium mb-2">No Quizzes Yet</p>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Create your first quiz to start testing your students
            </p>
            <Link to="/create-quiz">
              <Button>Create Quiz</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
