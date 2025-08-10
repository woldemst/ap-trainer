import React from "react";

export default function Question({ data, showSteps, showAnswer }) {
  return (
    <div className="question-card">
      <h2>{data.topic}</h2>
      <p className="q-text"><strong>Aufgabe:</strong> {data.question}</p>

      {showSteps && (
        <div className="steps">
          <strong>Rechenweg / Lösungsschritte:</strong>
          <pre>{data.steps}</pre>
        </div>
      )}

      {showAnswer && (
        <div className="answer">
          <strong>Lösung:</strong>
          <p>{data.answer}</p>
        </div>
      )}
    </div>
  );
}
