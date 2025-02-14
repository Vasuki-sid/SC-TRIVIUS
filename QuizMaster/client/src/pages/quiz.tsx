
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Timer, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Quiz, QuizAttempt } from "@shared/schema";

type QuizPageProps = {
  params?: {
    id?: string;
  };
};

export default function QuizPage({ params }: QuizPageProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);

  // Validate quiz ID
  if (!params?.id || isNaN(parseInt(params.id))) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h1 className="text-xl font-semibold">Invalid Quiz URL</h1>
              <p className="text-muted-foreground">The quiz ID is missing or invalid.</p>
              <Button onClick={() => setLocation("/")}>Return Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const quizId = parseInt(params.id);
  const { data: quiz, isLoading, isError } = useQuery<Quiz>({
    queryKey: [`/api/quizzes/${quizId}`],
    queryFn: () => apiRequest("GET", `/api/quizzes/${quizId}`).then(res => res.json()),
    retry: false,
    staleTime: 0,
    refetchOnMount: true
  });

  const createAttempt = useMutation({
    mutationFn: async (answers: number[]) => {
      const res = await apiRequest("POST", "/api/attempts", {
        quizId,
        answers,
        score: 0,
        completed: true,
        submittedAt: new Date().toISOString()
      });
      return res.json();
    },
    onSuccess: (data: QuizAttempt) => {
      setLocation(`/results/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const submitQuiz = useCallback(() => {
    if (!quiz) return;

    if (answers.length !== quiz.questions.length) {
      toast({
        title: "Warning",
        description: "Please answer all questions before submitting",
        variant: "destructive"
      });
      return;
    }
    createAttempt.mutate(answers);
  }, [answers, quiz, createAttempt, toast]);

  useEffect(() => {
    if (quiz) {
      setTimeLeft(quiz.timeLimit);
      setAnswers(new Array(quiz.questions.length).fill(-1));
    }
  }, [quiz]);

  useEffect(() => {
    if (timeLeft <= 0) {
      submitQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitQuiz]);

  if (isLoading) {
    return <div className="container mx-auto p-6">Loading quiz...</div>;
  }

  if (isError || !quiz) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-destructive" />
              <h1 className="text-xl font-semibold">Quiz Not Found</h1>
              <p className="text-muted-foreground">This quiz doesn't exist or has been removed.</p>
              <Button onClick={() => setLocation("/")}>Return Home</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = parseInt(value);
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6">
            <h2 className="text-xl mb-4">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </h2>
            <p className="text-lg">{quiz.questions[currentQuestion].question}</p>
          </div>

          <RadioGroup
            value={answers[currentQuestion]?.toString()}
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            {quiz.questions[currentQuestion].options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            {currentQuestion === quiz.questions.length - 1 ? (
              <Button onClick={submitQuiz} disabled={createAttempt.isPending}>
                {createAttempt.isPending ? "Submitting..." : "Submit Quiz"}
              </Button>
            ) : (
              <Button onClick={nextQuestion}>Next Question</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
