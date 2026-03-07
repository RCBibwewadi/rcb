"use client";

import { useState, useEffect, useRef } from "react";
import { X, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { SeriesCard, Question } from "@/lib/types";

interface QuizModalProps {
  series: SeriesCard;
  onClose: () => void;
  onQuizComplete?: () => void;
}

export default function QuizModal({ series, onClose, onQuizComplete }: QuizModalProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(420); // 7 minutes in seconds
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    totalQuestions: number;
    timeTaken: number;
  } | null>(null);
  const [errorBanner, setErrorBanner] = useState<string>("");
  const [timeUpBanner, setTimeUpBanner] = useState(false);
  
  const submitAttemptedRef = useRef(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (started && !submitted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [started, submitted, timeLeft]);

  // Auto-submit when timer reaches 0
  useEffect(() => {
    if (started && !submitted && !submitting && timeLeft === 0 && !submitAttemptedRef.current) {
      submitAttemptedRef.current = true;
      setTimeUpBanner(true);
      handleSubmit();
    }
  }, [timeLeft, started, submitted, submitting]);

  const handleApiError = (message: string) => {
    setErrorBanner(message);
    setSubmitting(false);
    submitAttemptedRef.current = false;
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/game/questions/${series.id}`,{
        method: "GET",
        credentials: "include",
      });
  
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expired. Please login again.");
        }
        throw new Error("Failed to load questions.");
      }
  
      const data = await response.json();
  
      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions available for this quiz.");
      }
  
      setQuestions(data.questions);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      handleApiError(
        error instanceof Error ? error.message : "Unable to load quiz."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    setStarted(true);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (submitted || submitting ) return;

    setSubmitting(true);
    const timeTaken = 420 - timeLeft;

    try {
      console.log('Submitting quiz:', { seriesId: series.id, answers, timeTaken });
      
      const response = await fetch("/api/game/submit", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seriesId: series.id,
          answers,
          timeTaken,
        }),
      });

      const data = await response.json();
      
      console.log('Submit response:', data);

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to submit quiz");
      }

      setSubmitted(true);
      setResult({
        score: data.score,
        totalQuestions: data.totalQuestions,
        timeTaken: data.timeTaken,
      });
      
      // Notify parent to refresh completed series
      if (onQuizComplete) {
        onQuizComplete();
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
    
      if (error instanceof Error) {
        if (error.message.includes("Unauthorized")) {
          handleApiError("Your session expired. Please login again.");
          return;
        }
    
        handleApiError(error.message);
      } else {
        handleApiError("Something went wrong while submitting the quiz.");
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-rose-tan mx-auto"></div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-mauve-wine mb-4">
            Quiz Complete!
          </h2>
          <div className="space-y-3 mb-6">
            <p className="text-xl text-mauve-wine">
              Score: <span className="font-bold">{result.score}</span> /{" "}
              {result.totalQuestions}
            </p>
            <p className="text-lg text-mauve-wine-light">
              Time: {formatTime(result.timeTaken)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-rose-tan hover:bg-rose-tan-dark text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-mauve-wine-light hover:text-mauve-wine"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-3xl font-bold text-mauve-wine mb-4 text-center">
            {series.name}
          </h2>
          <p className="text-center text-mauve-wine-light mb-6">
            Ready to test your knowledge?
          </p>

          <div className="bg-rose-tan/10 rounded-lg p-6 mb-6 space-y-3">
            <p className="text-mauve-wine">
              📝 <span className="font-semibold">11 Questions</span>
            </p>
            <p className="text-mauve-wine">
              ⏱️ <span className="font-semibold">7 Minutes</span>
            </p>
            <p className="text-mauve-wine">
              🎯 <span className="font-semibold">Multiple Choice</span>
            </p>
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-rose-tan hover:bg-rose-tan-dark text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 my-8 relative">
        {/* Error Banner */}
        {errorBanner && (
          <div className="absolute top-4 left-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg flex items-center gap-3 z-10 animate-slide-down">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm flex-1">{errorBanner}</p>
            <button onClick={() => setErrorBanner("")} className="text-white hover:text-gray-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Time Up Banner */}
        {timeUpBanner && (
          <div className="absolute top-4 left-4 right-4 bg-orange-500 text-white px-4 py-3 rounded-lg flex items-center gap-3 z-10 animate-slide-down">
            <Clock className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm flex-1">Time&apos;s up! Your quiz has been automatically submitted.</p>
          </div>
        )}

        <div className="flex justify-between items-center mb-6 mt-16">
          <div className={`flex items-center gap-2 ${
            timeLeft <= 60 ? "text-red-600 animate-pulse" : "text-mauve-wine"
          }`}>
            <Clock className="w-5 h-5" />
            <span className="font-semibold text-lg">{formatTime(timeLeft)}</span>
            {timeLeft <= 60 && timeLeft > 0 && (
              <span className="text-sm font-normal">(Hurry!)</span>
            )}
          </div>
          <div className="text-mauve-wine font-semibold">
            Question {currentQuestion + 1} / {questions.length}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-mauve-wine mb-6">
            {currentQ.question_text}
          </h3>

          <div className="space-y-3">
            {["A", "B", "C", "D"].map((option) => {
              const optionText =
                currentQ[`option_${option.toLowerCase()}` as keyof Question];
              const isSelected = answers[currentQ.id] === option;

              return (
                <button
                  key={option}
                  onClick={() => handleAnswer(currentQ.id, option)}
                  disabled={submitting}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-rose-tan bg-rose-tan/10"
                      : "border-gray-200 hover:border-rose-tan-light"
                  } ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="font-semibold text-mauve-wine mr-3">
                    {option}.
                  </span>
                  <span className="text-mauve-wine">{optionText as string}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between gap-4">
          <button
            onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0 || submitting}
            className="px-6 py-3 border-2 border-rose-tan text-rose-tan rounded-lg font-semibold hover:bg-rose-tan hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion((prev) => prev + 1)}
              disabled={submitting}
              className="px-6 py-3 bg-rose-tan text-white rounded-lg font-semibold hover:bg-rose-tan-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < questions.length || submitting}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>

        <div className="mt-4 flex gap-2 flex-wrap justify-center">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              disabled={submitting}
              className={`w-8 h-8 rounded-full text-sm font-semibold ${
                answers[questions[index].id]
                  ? "bg-rose-tan text-white"
                  : "bg-gray-200 text-gray-600"
              } ${currentQuestion === index ? "ring-2 ring-mauve-wine" : ""} ${
                submitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
