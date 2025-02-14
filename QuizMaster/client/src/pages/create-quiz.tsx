import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { insertQuizSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";

const createQuizSchema = insertQuizSchema.extend({
  questions: z.array(z.object({
    question: z.string().min(1, "Question is required"),
    options: z.array(z.string().min(1, "Option is required")).min(2, "At least 2 options are required"),
    correctAnswer: z.number().min(0)
  })).min(1, "At least 1 question is required")
});

export default function CreateQuiz() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [questionCount, setQuestionCount] = useState(1);

  const form = useForm({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: "",
      description: "",
      timeLimit: 600,
      subject: "",
      teacherId: user?.id,
      questions: [{
        question: "",
        options: ["", ""],
        correctAnswer: 0
      }]
    }
  });

  const createQuizMutation = useMutation({
    mutationFn: async (data: z.infer<typeof createQuizSchema>) => {
      const res = await apiRequest("POST", "/api/quizzes", {
        ...data,
        timeLimit: Number(data.timeLimit),
        teacherId: user?.id
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Quiz created successfully"
      });
      navigate("/teacher-dashboard");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const addQuestion = () => {
    const questions = form.getValues("questions");
    form.setValue("questions", [
      ...questions,
      {
        question: "",
        options: ["", ""],
        correctAnswer: 0
      }
    ]);
    setQuestionCount(prev => prev + 1);
  };

  const addOption = (questionIndex: number) => {
    const questions = form.getValues("questions");
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push("");
    form.setValue("questions", updatedQuestions);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const questions = form.getValues("questions");
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    form.setValue("questions", updatedQuestions);
  };

  const onSubmit = form.handleSubmit((data) => {
    createQuizMutation.mutate(data);
  });

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={onSubmit} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quiz Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter quiz title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter quiz description"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter subject" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Limit (seconds)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="60"
                        placeholder="Enter time limit in seconds"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-6">
                {Array.from({ length: questionCount }).map((_, questionIndex) => (
                  <div key={questionIndex} className="border rounded-lg p-4">
                    <FormField
                      control={form.control}
                      name={`questions.${questionIndex}.question`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Question {questionIndex + 1}</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter question" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="mt-4 space-y-2">
                      {form.getValues(`questions.${questionIndex}.options`).map((_, optionIndex) => (
                        <div key={optionIndex} className="flex gap-2">
                          <FormField
                            control={form.control}
                            name={`questions.${questionIndex}.options.${optionIndex}`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormControl>
                                  <Input placeholder={`Option ${optionIndex + 1}`} {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(questionIndex, optionIndex)}
                            disabled={form.getValues(`questions.${questionIndex}.options`).length <= 2}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(questionIndex)}
                      >
                        Add Option
                      </Button>
                    </div>

                    <FormField
                      control={form.control}
                      name={`questions.${questionIndex}.correctAnswer`}
                      render={({ field }) => (
                        <FormItem className="mt-4">
                          <FormLabel>Correct Answer</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max={form.getValues(`questions.${questionIndex}.options`).length - 1}
                              placeholder="Enter correct answer index (0-based)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                onClick={addQuestion}
              >
                <PlusCircle className="h-4 w-4" />
                Add Question
              </Button>

              <Button
                type="submit"
                className="w-full"
                disabled={createQuizMutation.isPending}
              >
                {createQuizMutation.isPending ? "Creating..." : "Create Quiz"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
