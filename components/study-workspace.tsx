"use client";

import { useMemo, useRef, useState } from "react";
import {
  BookOpen, Brain, Check, ChevronRight, CircleHelp, FileText, GraduationCap,
  Layers3, LoaderCircle, MessageCircle, Plus, Sparkles, UploadCloud, X,
} from "lucide-react";

type Task = "explain" | "summarise" | "quiz" | "chat";
type QuizQuestion = {
  question: string;
  options: { id: "A" | "B" | "C" | "D"; text: string }[];
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
};
type QuizResult = { title: string; questions: QuizQuestion[] };

const tools: { id: Task; label: string; description: string; icon: typeof BookOpen }[] = [
  { id: "explain", label: "Simplify a topic", description: "Make difficult ideas easier to understand.", icon: Brain },
  { id: "summarise", label: "Revision notes", description: "Turn long notes into focused study material.", icon: Layers3 },
  { id: "quiz", label: "Generate a quiz", description: "Test your understanding with MCQs.", icon: CircleHelp },
  { id: "chat", label: "Ask your notes", description: "Get answers grounded in your material.", icon: MessageCircle },
];

export default function StudyWorkspace() {
  const [sourceText, setSourceText] = useState("");
  const [fileName, setFileName] = useState("");
  const [task, setTask] = useState<Task>("explain");
  const [topic, setTopic] = useState("");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<string | QuizResult>("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const wordCount = useMemo(() => sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0, [sourceText]);
  const quiz = typeof result === "object" && result !== null ? result : null;

  async function upload(file?: File) {
    if (!file) return;
    setError("");
    setNotice("");
    setResult("");
    setSubmitted(false);
    const form = new FormData();
    form.append("file", file);
    setLoading(true);
    try {
      const response = await fetch("/api/documents", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Document upload failed.");
      setSourceText(payload.data.text);
      setFileName(payload.data.fileName);
      setNotice(payload.data.truncated
        ? "The document is longer than the current processing limit. The first section was loaded; check the source before relying on a whole-document summary."
        : "Your document is ready. Choose a study tool to get started.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read this file.");
    } finally {
      setLoading(false);
    }
  }

  async function generate() {
    setError("");
    setNotice("");
    setResult("");
    setAnswers({});
    setSubmitted(false);
    if (sourceText.trim().length < 30) {
      setError("Add or upload at least a short section of your lecture material first.");
      return;
    }
    if (task === "chat" && !question.trim()) {
      setError("Enter a question about your notes first.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, sourceText, topic, question, questionCount: 8, difficulty: "medium" }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || "The request failed.");
      setResult(payload.data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function resetDocument() {
    setSourceText("");
    setFileName("");
    setResult("");
    setError("");
    setNotice("");
    setAnswers({});
    setSubmitted(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  const score = quiz ? quiz.questions.filter((q, i) => answers[i] === q.correctAnswer).length : 0;

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1440px]">
        <aside className="hidden w-[248px] shrink-0 border-r border-[#e5ebe6] bg-white px-5 py-7 lg:flex lg:flex-col">
          <a href="#" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#246b4a] text-white"><GraduationCap size={22} /></span>
            <span><strong className="block text-[15px] tracking-tight">STUDYFLOW <span className="text-[#43845f]">AI</span></strong><small className="text-[11px] text-[#849087]">Your learning workspace</small></span>
          </a>
          <div className="mt-12">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#9aa59d]">Workspace</p>
            <div className="flex items-center gap-3 rounded-xl bg-[#edf5ef] px-3 py-3 text-sm font-semibold text-[#246b4a]"><Layers3 size={17} /> Study dashboard</div>
            <div className="mt-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#78857d]"><FileText size={17} /> My materials <span className="ml-auto rounded-full bg-[#f1f4f1] px-2 py-0.5 text-[10px]">1</span></div>
          </div>
          <div className="mt-10">
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-[#9aa59d]">Study tools</p>
            {tools.map((item) => <button key={item.id} onClick={() => { setTask(item.id); setResult(""); }} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${task === item.id ? "bg-[#edf5ef] font-semibold text-[#246b4a]" : "text-[#78857d] hover:bg-[#f6f8f6]"}`}><item.icon size={17} />{item.label}</button>)}
          </div>
          <div className="mt-auto rounded-2xl bg-[#f3f7f3] p-4">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#43845f]"><Sparkles size={16} /></div>
            <p className="text-sm font-semibold">Small steps add up.</p>
            <p className="mt-1 text-xs leading-5 text-[#78857d]">Understand a little today. Remember more tomorrow.</p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-10 lg:py-9">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2 lg:hidden"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#246b4a] text-white"><GraduationCap size={20} /></span><b className="text-sm">STUDYFLOW AI</b></div>
            <div className="hidden text-xs text-[#87938b] lg:block">Workspace <ChevronRight className="mx-1 inline" size={13} /> Overview</div>
            <div className="flex items-center gap-2 rounded-full border border-[#e5ebe6] bg-white px-3 py-2 text-xs font-medium text-[#647269]"><span className="h-2 w-2 rounded-full bg-[#69a77c]" /> Learning mode</div>
          </header>

          <div className="mt-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-[#43845f]">YOUR STUDY SPACE</p>
              <h1 className="max-w-2xl text-3xl font-semibold tracking-[-.045em] text-[#1b2b22] sm:text-4xl">Make your study time <span className="text-[#43845f]">count.</span></h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#77847b]">Bring your lecture notes. We’ll help you understand them, revise smarter, and practise what you learn.</p>
            </div>
            <div className="soft-grid hidden h-24 w-40 place-items-center rounded-2xl border border-[#e3ebe4] md:grid"><div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#43845f] shadow-sm"><BookOpen size={27} /></div></div>
          </div>

          <div className="mt-9 grid gap-5 xl:grid-cols-[1.08fr_.92fr]">
            <div className="surface rounded-3xl p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div><div className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#edf5ef] text-[#43845f]"><UploadCloud size={17} /></span> Your study material</div><p className="mt-2 text-xs leading-5 text-[#87938b]">Upload a lecture note or paste text to begin.</p></div>
                {sourceText && <button onClick={resetDocument} className="rounded-lg p-2 text-[#87938b] hover:bg-[#f3f6f3]" aria-label="Clear document"><X size={16} /></button>}
              </div>
              <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
              <button onClick={() => fileRef.current?.click()} disabled={loading} className="mt-5 flex w-full flex-col items-center rounded-2xl border border-dashed border-[#bfd2c3] bg-[#f8fbf8] px-4 py-7 text-center transition hover:border-[#6b9c7a] hover:bg-[#f2f8f3] disabled:opacity-50">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#43845f] shadow-sm"><UploadCloud size={21} /></span>
                <span className="mt-3 text-sm font-semibold text-[#304237]">{fileName || "Choose a file to upload"}</span>
                <span className="mt-1 text-xs text-[#87938b]">PDF, DOCX or TXT · Maximum 8 MB</span>
                <span className="mt-4 rounded-lg bg-[#246b4a] px-4 py-2 text-xs font-semibold text-white">Browse files</span>
              </button>
              <div className="my-4 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[.16em] text-[#a0aaa3]"><span className="h-px flex-1 bg-[#edf0ed]" />or paste your notes<span className="h-px flex-1 bg-[#edf0ed]" /></div>
              <textarea value={sourceText} onChange={(e) => { setSourceText(e.target.value); setFileName(""); }} placeholder="Paste your lecture notes or a section you want to understand..." className="min-h-[130px] w-full resize-y rounded-xl border border-[#e5ebe6] bg-white p-4 text-sm leading-6 text-[#304237] outline-none transition placeholder:text-[#a1aaa4] focus:border-[#82ad8e] focus:ring-4 focus:ring-[#edf5ef]" />
              <div className="mt-2 flex items-center justify-between text-[11px] text-[#96a198]"><span>{wordCount.toLocaleString()} words</span><span>Text is processed for your current session.</span></div>
              {notice && <p className="mt-3 flex items-start gap-2 rounded-xl bg-[#edf6ef] p-3 text-xs leading-5 text-[#356d49]"><Check size={15} className="mt-0.5 shrink-0" />{notice}</p>}
            </div>

            <div className="surface rounded-3xl p-5 sm:p-6">
              <div className="text-sm font-semibold">What would you like to do?</div>
              <p className="mt-2 text-xs leading-5 text-[#87938b]">Choose a study tool for your material.</p>
              <div className="mt-5 space-y-2">
                {tools.map((item) => <button key={item.id} onClick={() => { setTask(item.id); setResult(""); setError(""); }} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${task === item.id ? "border-[#9dbda5] bg-[#f2f8f3]" : "border-[#edf0ed] bg-white hover:border-[#d4e2d7]"}`}>
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${task === item.id ? "bg-[#246b4a] text-white" : "bg-[#f3f6f3] text-[#6f8e78]"}`}><item.icon size={18} /></span>
                  <span className="min-w-0 flex-1"><b className="block text-xs font-semibold text-[#304237]">{item.label}</b><small className="mt-1 block text-[11px] text-[#89958d]">{item.description}</small></span>
                  {task === item.id && <span className="text-[#43845f]"><Check size={17} /></span>}
                </button>)}
              </div>
              {task === "chat" && <label className="mt-4 block text-xs font-medium text-[#526157]">Your question<textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What is the main idea of this topic?" className="mt-2 min-h-20 w-full rounded-xl border border-[#e5ebe6] p-3 text-sm outline-none focus:border-[#82ad8e]" /></label>}
              {task !== "chat" && <label className="mt-4 block text-xs font-medium text-[#526157]">Topic (optional)<input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Principles of cooperation" className="mt-2 w-full rounded-xl border border-[#e5ebe6] px-3 py-3 text-sm outline-none focus:border-[#82ad8e]" /></label>}
              <button onClick={generate} disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#246b4a] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174d35] disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? <><LoaderCircle size={17} className="animate-spin" /> Working on it...</> : <><Sparkles size={16} /> Generate with AI <ChevronRight size={16} /></>}
              </button>
              {error && <p role="alert" className="mt-3 rounded-xl border border-[#f1d5d0] bg-[#fff7f5] p-3 text-xs leading-5 text-[#a24a3e]">{error}</p>}
            </div>
          </div>

          <div className="surface mt-5 min-h-48 rounded-3xl p-5 sm:p-6">
            <div className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#edf5ef] text-[#43845f]"><Sparkles size={17} /></span> Your study result</div>
            {!result && !loading && <div className="flex min-h-32 flex-col items-center justify-center text-center"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f4f7f4] text-[#9aaba0]"><Plus size={19} /></div><p className="mt-3 text-sm font-medium text-[#647269]">Your learning output will appear here</p><p className="mt-1 text-xs text-[#98a39b]">Upload or paste notes, choose a tool, and generate your first result.</p></div>}
            {loading && <div className="flex min-h-32 items-center justify-center gap-3 text-sm text-[#718078]"><LoaderCircle size={18} className="animate-spin text-[#43845f]" />Preparing your study material...</div>}
            {typeof result === "string" && result && <article className="prose prose-sm mt-5 max-w-none whitespace-pre-wrap text-sm leading-7 text-[#405047]">{result}</article>}
            {quiz && <div className="mt-5 space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold">{quiz.title}</h2><span className="rounded-full bg-[#edf5ef] px-3 py-1 text-xs text-[#356d49]">{quiz.questions.length} questions</span></div>{quiz.questions.map((q, i) => <div key={i} className="rounded-2xl border border-[#e8eee9] p-4"><p className="text-sm font-semibold leading-6">{i + 1}. {q.question}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{q.options.map((option) => { const selected = answers[i] === option.id; const correct = submitted && q.correctAnswer === option.id; const wrong = submitted && selected && !correct; return <button key={option.id} disabled={submitted} onClick={() => setAnswers((old) => ({ ...old, [i]: option.id }))} className={`rounded-xl border p-3 text-left text-xs leading-5 transition ${correct ? "border-[#7eb28a] bg-[#edf7ef] text-[#285f3a]" : wrong ? "border-[#e3a59b] bg-[#fff4f1] text-[#98483d]" : selected ? "border-[#7da78a] bg-[#f1f7f2]" : "border-[#edf0ed] hover:bg-[#f8faf8]"}`}><b className="mr-2">{option.id}.</b>{option.text}</button>; })}</div>{submitted && <p className="mt-3 rounded-xl bg-[#f6f8f6] p-3 text-xs leading-5 text-[#58665d]"><b>Explanation:</b> {q.explanation}</p>}</div>)}{!submitted ? <button onClick={() => setSubmitted(true)} disabled={Object.keys(answers).length !== quiz.questions.length} className="rounded-xl bg-[#246b4a] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Submit answers</button> : <div className="rounded-2xl bg-[#edf5ef] p-4 text-sm font-semibold text-[#285f3a]">You scored {score} out of {quiz.questions.length}. Review the explanations above to strengthen your understanding.</div>}</div>}
          </div>
          <footer className="mt-8 flex flex-col justify-between gap-2 border-t border-[#e5ebe6] pt-5 text-[11px] text-[#9aa59d] sm:flex-row"><span>STUDYFLOW AI · Learn with clarity.</span><span>AI-generated study material can contain errors. Check important facts against your course notes.</span></footer>
        </section>
      </div>
    </main>
  );
}
