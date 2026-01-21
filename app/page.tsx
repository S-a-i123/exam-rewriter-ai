"use client";

import { useState } from "react";

export default function Home() {
  const [subject, setSubject] = useState("Science");
  const [questionType, setQuestionType] = useState("Short Answer");
  const [marks, setMarks] = useState(5);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  // ✅ Convert any value to safe text (string) for UI
  const toText = (value: any) => {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    return JSON.stringify(value, null, 2);
  };

  // ✅ Ensure value is always an array
  const toArray = (value: any) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    if (typeof value === "object") return Object.values(value);
    return [String(value)];
  };

  async function evaluateAnswer() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          questionType,
          marks,
          question,
          answer,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold">📘 Exam Rewriter AI</h1>
        <p className="text-gray-600 mt-2">
          Paste your answer → Get marks + missing points + topper version.
        </p>

        {/* FORM */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">
          {/* Left Panel */}
          <div className="p-4 bg-white rounded-xl shadow">
            <label className="text-sm font-semibold">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-2 w-full border rounded-lg p-2"
            >
              <option>Science</option>
              <option>Social</option>
              <option>DBMS</option>
              <option>Operating Systems</option>
              <option>Computer Networks</option>
              <option>General</option>
            </select>

            <label className="text-sm font-semibold mt-4 block">
              Question Type
            </label>
            <select
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="mt-2 w-full border rounded-lg p-2"
            >
              <option>Short Answer</option>
              <option>Long Answer</option>
              <option>Essay</option>
            </select>

            <label className="text-sm font-semibold mt-4 block">Marks</label>
            <input
              type="number"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              className="mt-2 w-full border rounded-lg p-2"
              min={1}
              max={30}
            />
          </div>

          {/* Right Panel */}
          <div className="md:col-span-2 p-4 bg-white rounded-xl shadow">
            <label className="text-sm font-semibold">Question</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter question here..."
              className="mt-2 w-full border rounded-lg p-3 h-24"
            />

            <label className="text-sm font-semibold mt-4 block">
              Your Answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Paste your answer here..."
              className="mt-2 w-full border rounded-lg p-3 h-48"
            />

            <button
              onClick={evaluateAnswer}
              disabled={loading || !question || !answer}
              className="mt-4 px-5 py-3 rounded-xl bg-black text-white font-semibold disabled:opacity-50"
            >
              {loading ? "Evaluating..." : "Evaluate Answer"}
            </button>

            {error && (
              <p className="mt-4 text-red-600 font-semibold">{error}</p>
            )}
          </div>
        </div>

        {/* RESULT */}
        {result && (
          <div className="mt-10 grid md:grid-cols-2 gap-4">
            {/* Score Panel */}
            <div className="p-4 bg-white rounded-xl shadow">
              <h2 className="text-xl font-bold">✅ Score</h2>
              <p className="mt-2 text-2xl font-extrabold">
                {toText(result.estimated_marks)} / {marks}
              </p>

              <h3 className="mt-4 font-bold">❌ Missing Points</h3>
              <ul className="list-disc pl-5 mt-2 text-gray-700">
                {toArray(result.missing_points).map((p: any, i: number) => (
                  <li key={i}>{toText(p)}</li>
                ))}
              </ul>

              <h3 className="mt-4 font-bold">📌 Improvements</h3>
              <ul className="list-disc pl-5 mt-2 text-gray-700">
                {toArray(result.improvements).map((p: any, i: number) => (
                  <li key={i}>{toText(p)}</li>
                ))}
              </ul>
            </div>

            {/* Topper Answer Panel */}
            <div className="p-4 bg-white rounded-xl shadow">
              <h2 className="text-xl font-bold">🏆 Topper Answer</h2>
              <pre className="mt-3 whitespace-pre-wrap bg-gray-100 p-4 rounded-lg text-gray-800">
                {toText(result.topper_answer)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
