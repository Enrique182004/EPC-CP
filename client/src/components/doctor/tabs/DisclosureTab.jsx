import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { disclosures } from "../../../api/index.js";
import { DISCLOSURE_QUESTIONS } from "../../../utils/constants.js";

export default function DisclosureTab({ doctorId }) {
  const qc = useQueryClient();
  const [msg, setMsg] = useState("");

  const { data = [], isLoading } = useQuery({
    queryKey: ["disclosures", doctorId],
    queryFn: () => disclosures.get(doctorId),
  });

  const [answers, setAnswers] = useState({});

  const currentAnswers = (key) => {
    if (answers[key] !== undefined) return answers[key];
    const found = data.find((d) => d.question_key === key);
    return found || { answer: 0, explanation: "" };
  };

  const setAnswer = (key, field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [key]: { ...currentAnswers(key), [field]: value },
    }));
  };

  const handleSave = async () => {
    const payload = DISCLOSURE_QUESTIONS.map((q) => ({
      question_key: q.key,
      ...currentAnswers(q.key),
    }));
    try {
      await disclosures.save(doctorId, payload);
      qc.invalidateQueries(["disclosures", doctorId]);
      setMsg("Disclosures saved.");
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Save failed.");
    }
  };

  if (isLoading) return <div className="text-gray-400 text-sm">Loading...</div>;

  return (
    <div className="card">
      <h3 className="font-semibold mb-1">Disclosure Questions</h3>
      <p className="text-sm text-gray-500 mb-4">
        Answer each question. If "Yes", please provide an explanation.
      </p>
      <div className="space-y-4">
        {DISCLOSURE_QUESTIONS.map((q) => {
          const current = currentAnswers(q.key);
          return (
            <div
              key={q.key}
              className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50"
            >
              <p className="text-sm font-medium text-gray-800 mb-2">
                {q.label}
              </p>
              <div className="flex gap-6 mb-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={q.key}
                    value="no"
                    checked={!current.answer}
                    onChange={() => setAnswer(q.key, "answer", 0)}
                  />
                  No
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name={q.key}
                    value="yes"
                    checked={!!current.answer}
                    onChange={() => setAnswer(q.key, "answer", 1)}
                  />
                  Yes
                </label>
              </div>
              {!!current.answer && (
                <textarea
                  className="input text-sm"
                  rows={2}
                  placeholder="Please explain..."
                  value={current.explanation || ""}
                  onChange={(e) =>
                    setAnswer(q.key, "explanation", e.target.value)
                  }
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button className="btn-primary" onClick={handleSave}>
          Save Disclosures
        </button>
        {msg && <span className="text-sm text-green-600">{msg}</span>}
      </div>
    </div>
  );
}
