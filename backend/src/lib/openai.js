import { ENV } from "./env.js";

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

if (!ENV.OPENAI_API_KEY) {
  console.warn("⚠️ OPENAI_API_KEY is not set. Test generation will fail until configured.");
}

export async function generateTestCases({ description, examples = [], constraints = [] }) {
  if (!ENV.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured on the server");
  }

  const system = `
You are a code interview assistant. Given a problem description and examples, you will generate JavaScript unit test cases for a function named "solution".

Return ONLY strict JSON with this TypeScript type:
{
  "tests": Array<{
    "name": string;
    "input": any[];
    "expected": any;
  }>
}
No explanations, no backticks.
`;

  const user = `
Problem description:
${description || "N/A"}

Examples:
${JSON.stringify(examples, null, 2)}

Constraints:
${JSON.stringify(constraints, null, 2)}

The candidate will implement:

function solution(/* appropriate arguments */) { /* ... */ }

Generate 5–10 high‑quality tests that cover normal cases, edge cases, and corner cases.
`;

  const response = await fetch(OPENAI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ENV.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI error (${response.status}): ${text}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("Failed to parse OpenAI response as JSON");
  }

  if (!parsed.tests || !Array.isArray(parsed.tests)) {
    throw new Error("OpenAI response missing 'tests' array");
  }

  return parsed.tests;
}

