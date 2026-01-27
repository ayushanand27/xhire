import { generateTestCases } from "../lib/openai.js";

// POST /api/tests/generate
export const generateTests = async (req, res) => {
  try {
    const { description, examples, constraints } = req.body;

    if (!description) {
      return res.status(400).json({ error: "description is required to generate tests" });
    }

    const tests = await generateTestCases({ description, examples, constraints });

    res.json({ tests });
  } catch (error) {
    console.error("Error generating tests:", error);
    res.status(500).json({ error: error.message || "Failed to generate tests" });
  }
};

// POST /api/tests/run
// Body: { code: string, tests: Array<{ name, input, expected }> }
export const runTests = async (req, res) => {
  try {
    const { code, tests } = req.body;

    if (!code || !Array.isArray(tests)) {
      return res.status(400).json({ error: "code and tests[] are required" });
    }

    // For now we only support JavaScript using a "solution" function
    const harness = buildJsHarness(code, tests);

    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "javascript",
        version: "*",
        files: [{ name: "main.js", content: harness }],
      }),
    });

    const result = await response.json();

    let parsed;
    try {
      parsed = JSON.parse(result.run.stdout || "{}");
    } catch {
      parsed = null;
    }

    res.json({
      success: !result.run.stderr,
      rawOutput: result.run.stdout || "",
      errorOutput: result.run.stderr || "",
      results: parsed?.results || [],
    });
  } catch (error) {
    console.error("Error running tests:", error);
    res.status(500).json({ error: error.message || "Failed to run tests" });
  }
};

function buildJsHarness(userCode, tests) {
  const testsLiteral = JSON.stringify(tests);

  return `
${userCode}

function __deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const tests = ${testsLiteral};

const results = [];

for (const t of tests) {
  let passed = false;
  let received;
  let error = null;
  try {
    if (Array.isArray(t.input)) {
      received = solution(...t.input);
    } else {
      received = solution(t.input);
    }
    passed = __deepEqual(received, t.expected);
  } catch (e) {
    error = String(e);
  }
  results.push({
    name: t.name,
    input: t.input,
    expected: t.expected,
    received,
    passed,
    error,
  });
}

console.log(JSON.stringify({ results }));
`;
}

