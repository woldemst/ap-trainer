import React, { useEffect, useState } from "react";
import Question from "./Question";
import questions from "../data/questions";
import "./ExamSimulation.css"; // kleines Styling

const STORAGE_KEY = "ap1_trainer_state_v1";

function ExamSimulation() {
  const [index, setIndex] = useState(0);
  const [showSteps, setShowSteps] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState({}); // {id: "correct"|"wrong"}

  // lade Zustand aus localStorage
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const obj = JSON.parse(raw);
        setIndex(obj.index ?? 0);
        setShowSteps(false);
        setShowAnswer(false);
        setAnswers(obj.answers ?? {});
      } catch (e) {
        console.warn("korrupter Speicher, neuer Start");
      }
    }
  }, []);

  // speichere Zustand bei Änderungen
  useEffect(() => {
    const state = { index, answers, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [index, answers]);

  const current = questions[index];

  const markAnswer = (id, result) => {
    setAnswers(prev => ({ ...prev, [id]: result }));
  };

  const nextQuestion = () => {
    setShowSteps(false);
    setShowAnswer(false);
    setIndex(prev => (prev + 1) % questions.length);
  };

  const prevQuestion = () => {
    setShowSteps(false);
    setShowAnswer(false);
    setIndex(prev => (prev - 1 + questions.length) % questions.length);
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
          className={answers[current.id] === "correct" ? "good" : ""}
          onClick={() => markAnswer(current.id, "correct")}
        >
          Ich hatte richtig
        </button>
        <button
          className={answers[current.id] === "wrong" ? "bad" : ""}
          onClick={() => markAnswer(current.id, "wrong")}
        >
          Ich hatte falsch
        </button>
      </div>

      <div className="nav">
        <button onClick={prevQuestion}>← Zurück</button>
        <button onClick={nextQuestion}>Nächste →</button>
      </div>

      <div className="summary">
        <small>
          Merker: {Object.keys(answers).length} beantwortet •
          Fehler: {Object.values(answers).filter(v => v === "wrong").length}
        </small>
      </div>
    </div>
  );
}

export default ExamSimulation;
