import React, { useEffect, useState } from "react";
import Question from "./Question";
import questions from "../data/questions"; // falls JSON: import "../data/questions.json"
import "./ExamSimulation.css"; // kleines Styling

const STORAGE_KEY = "ap1_trainer_state_v1";

function ExamSimulation() {
  // Lade initialen Zustand direkt aus localStorage (robust)
  const [index, setIndex] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        const idx = typeof obj.index === "number" ? obj.index : 0;
        if (Array.isArray(questions) && questions.length > 0) {
          return Math.min(Math.max(0, idx), questions.length - 1);
        }
        return idx;
      }
    } catch (e) {
      // ignore parse errors
    }
    return 0;
  });

  const [showSteps, setShowSteps] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const [answers, setAnswers] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const obj = JSON.parse(raw);
        return obj.answers || {};
      }
    } catch (e) {
      // ignore
    }
    return {};
  });

  // Speichere Zustand bei Änderungen (mit try/catch)
  useEffect(() => {
    const state = { index, answers, timestamp: Date.now() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("localStorage write failed", e);
    }
  }, [index, answers]);

  // Extra: sicherheitshalber beim Unload speichern
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ index, answers, timestamp: Date.now() })
        );
      } catch (e) {
        /* ignore */
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [index, answers]);

  // Safety: current kann null sein, falls questions leer oder falsch importiert
  const current =
    Array.isArray(questions) && questions.length > 0 ? questions[index] : null;

  if (!current) {
    return (
      <div className="exam-wrap">
        <div className="header">
          <h1>AP I Trainer — Prüfungssimulation</h1>
        </div>
        <p>Keine Fragen geladen. Prüfe src/data/questions (Import/Dateiname).</p>
      </div>
    );
  }

  const markAnswer = (id, result) => {
    setAnswers((prev) => ({ ...prev, [id]: result }));
  };

  const nextQuestion = () => {
    setShowSteps(false);
    setShowAnswer(false);
    setIndex((prev) => (questions.length ? (prev + 1) % questions.length : 0));
  };

  const prevQuestion = () => {
    setShowSteps(false);
    setShowAnswer(false);
    setIndex((prev) =>
      questions.length ? (prev - 1 + questions.length) % questions.length : 0
    );
  };

  // Export-Button: Fehlerkatalog (wie vorher)
  const exportErrors = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return alert("Keine Daten zum Exportieren");
    const obj = JSON.parse(raw);
    const answersObj = obj.answers || {};
    const errors = Object.entries(answersObj).filter(([id, v]) => v === "wrong");
    const payload = {
      exportedAt: new Date().toISOString(),
      totalAnswered: Object.keys(answersObj).length,
      errorCount: errors.length,
      errors: errors.map(([id, v]) => {
        const q = questions.find((x) => x.id === Number(id));
        return { id: Number(id), topic: q?.topic, question: q?.question, yourResult: v };
      }),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ap1_errors_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="exam-wrap">
      <div className="header">
        <h1>AP I Trainer — Prüfungssimulation</h1>
        <div className="progress">
          Frage {index + 1} / {questions.length}
        </div>
      </div>

      <Question data={current} showSteps={showSteps} showAnswer={showAnswer} />

      <div className="controls">
        <button onClick={() => setShowSteps(true)}>Rechenweg anzeigen</button>
        <button onClick={() => setShowAnswer(true)}>Lösung anzeigen</button>
      </div>

      <div className="marking">
        <button
          className={answers[current?.id] === "correct" ? "good" : ""}
          onClick={() => current && markAnswer(current.id, "correct")}
        >
          Ich hatte richtig
        </button>
        <button
          className={answers[current?.id] === "wrong" ? "bad" : ""}
          onClick={() => current && markAnswer(current.id, "wrong")}
        >
          Ich hatte falsch
        </button>
      </div>

      <div className="nav">
        <button onClick={prevQuestion}>← Zurück</button>
        <button onClick={nextQuestion}>Nächste →</button>
      </div>

      {/* <button onClick={exportErrors}>Fehlerkatalog exportieren (JSON)</button> */}

      <div className="summary">
        <small>
          Merker: {Object.keys(answers).length} beantwortet • Fehler:{" "}
          {Object.values(answers).filter((v) => v === "wrong").length}
        </small>
      </div>
    </div>
  );
}

export default ExamSimulation;