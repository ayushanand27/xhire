import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ResultsPage() {
  const { sessionId } = useParams();
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/interview/${sessionId}`);
        if (!res.ok) throw new Error('Failed to load session');
        const data = await res.json();
        setEvaluation(data.evaluation || null);
      } catch (err) {
        console.error('Failed to load evaluation', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  if (loading) return <div className="p-4">Loading results...</div>;
  if (!evaluation) return <div className="p-4">No evaluation available for this session.</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Interview Results</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-white rounded shadow">
          <h4 className="font-medium">Technical Score</h4>
          <p className="text-2xl">{evaluation.technicalScore ?? evaluation.technical_score ?? 'N/A'}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h4 className="font-medium">Communication Score</h4>
          <p className="text-2xl">{evaluation.communicationScore ?? evaluation.communication_score ?? 'N/A'}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h4 className="font-medium">Confidence Score</h4>
          <p className="text-2xl">{evaluation.confidenceScore ?? evaluation.confidence_score ?? 'N/A'}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h4 className="font-medium">Behavioral Score</h4>
          <p className="text-2xl">{evaluation.behavioralScore ?? evaluation.behavioral_score ?? 'N/A'}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <h4 className="font-medium">Strengths</h4>
        <ul className="list-disc pl-6">
          {(evaluation.strengths || []).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded shadow mb-4">
        <h4 className="font-medium">Improvements</h4>
        <ul className="list-disc pl-6">
          {(evaluation.improvements || []).map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h4 className="font-medium">Detailed Feedback</h4>
        <pre className="whitespace-pre-wrap">{evaluation.detailedFeedback || evaluation.detailed_feedback || 'No feedback'}</pre>
      </div>
    </div>
  );
}
