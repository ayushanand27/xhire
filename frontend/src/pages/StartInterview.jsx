import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const normalizeApiBaseUrl = (value) => {
  if (!value || typeof value !== 'string') return 'http://localhost:4001';
  return value.trim().replace(/\/+$/, '').replace(/\/api\/?$/, '');
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

export default function StartInterview() {
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  // Helper to get Clerk token in the browser
  async function getClerkToken() {
    if (!window?.Clerk?.session?.getToken) {
      throw new Error('Clerk session is not ready yet. Please sign in again.');
    }

    const token = await window.Clerk.session.getToken();
    if (!token) {
      throw new Error('Unable to fetch Clerk token. Please sign in again.');
    }

    return token;
  }

  async function handleStart() {
    setError(null);
    if (!resumeText || !jdText) {
      setError('Please provide both resume and job description');
      return;
    }

    setLoading(true);
    try {
      const token = await getClerkToken();
      const headers = { 'Content-Type': 'application/json' };
      headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/interview`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ type: 'MOCK', resumeText, jdText }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to create interview');
      }

      const data = await res.json();
      const sessionId = data.sessionId || data.session?.id || data.session_id;
      if (!sessionId) throw new Error('No sessionId returned');

      navigate(`/interview/${sessionId}`);
    } catch (err) {
      console.error('Start interview failed', err);
      setError(err.message || 'Failed to start interview');
    } finally {
      setLoading(false);
    }
  }

  // Handle file input change and upload resume PDF
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      // Only allow PDFs
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('Only PDF files are allowed');
      }

      const token = await getClerkToken();
      const form = new FormData();
      form.append('resume', file, file.name);

      const res = await fetch(`${API_BASE_URL}/api/resume/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Upload failed');
      }

      const data = await res.json();
      // Prefill the resume textarea with the extracted text
      if (data?.extractedText) setResumeText(data.extractedText);
    } catch (err) {
      console.error('Upload failed', err);
      setError(err.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
      // reset input
      e.target.value = '';
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">Start Interview</h2>
      <p className="text-sm text-base-content/70 mb-6">
        Upload a PDF resume, review the extracted text, paste a job description, and then start the interview.
      </p>

      <div className="mb-4">
        <label className="block font-medium mb-2">Resume Text</label>
        <div className="flex flex-col gap-3 lg:flex-row">
          <textarea
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            className="flex-1 textarea textarea-bordered min-h-40"
            placeholder="Paste candidate resume text here or upload a PDF to auto-fill"
          />
          <div className="w-full lg:w-56 rounded-lg border border-base-300 p-4 bg-base-100">
            <label className="block text-sm font-medium mb-2">Upload PDF resume</label>
            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleFileChange}
              disabled={uploading || loading}
              className="file-input file-input-bordered w-full"
            />
            <p className="mt-2 text-xs text-base-content/70">
              PDF only. The server extracts text and fills the resume box automatically.
            </p>
            {uploading && (
              <div className="mt-3 flex items-center gap-2 text-sm text-base-content/80">
                <span className="loading loading-spinner loading-sm" />
                Uploading and extracting text...
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-2">Job Description</label>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          className="w-full textarea textarea-bordered min-h-40"
          placeholder="Paste job description here"
        />
      </div>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      <div>
        <button
          onClick={handleStart}
          disabled={loading || uploading}
          className="btn btn-primary"
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-sm" />
              Starting interview...
            </>
          ) : (
            'Start Interview'
          )}
        </button>
      </div>
    </div>
  );
}
