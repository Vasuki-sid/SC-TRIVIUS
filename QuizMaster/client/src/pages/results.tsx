import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Home } from "lucide-react";
import type { QuizAttempt, Quiz } from "@shared/schema";

export default function Results({ params }: { params: { id: string } }) {
  const { data: attempt } = useQuery<QuizAttempt>({
    queryKey: [`/api/attempts/${params.id}`]
  });

  const { data: quiz } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/${attempt?.quizId}`],
    enabled: !!attempt
  });

  if (!attempt || !quiz) {
    return <div>Loading results...</div>;
  }

  const correctAnswers = attempt.answers.reduce((count, answer, index) => {
    return count + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
  }, 0);

  const percentage = Math.round((correctAnswers / quiz.questions.length) * 100);

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex justify-center items-center gap-2">
            <Trophy className="h-8 w-8 text-primary" />
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">{quiz.title}</h2>
            <p className="text-4xl font-bold text-primary mb-2">{percentage}%</p>
            <p className="text-muted-foreground">
              You got {correctAnswers} out of {quiz.questions.length} questions correct
            </p>
          </div>

          <div className="space-y-4">
            {quiz.questions.map((question, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  attempt.answers[index] === question.correctAnswer
                    ? "bg-green-50 dark:bg-green-950"
                    : "bg-red-50 dark:bg-red-950"
                }`}
              >
                <p className="font-medium mb-2">{question.question}</p>
                <p className="text-sm">
                  Your answer: {question.options[attempt.answers[index]]}
                </p>
                <p className="text-sm">
                  Correct answer: {question.options[question.correctAnswer]}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <Link to="/">
              <Button className="gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
