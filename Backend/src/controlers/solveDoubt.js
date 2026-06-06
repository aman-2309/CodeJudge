// const Problem = require('../models/problem')
const { GoogleGenAI } = require('@google/genai')

const solveDoubt = async (req, res) => {

    try {
        const { userMessage, problem: requestProblem } = req.body;

        const problemId = requestProblem?._id || req.body.problemId;
        if (!problemId) return res.status(400).send("Problem ID is required");

        const problem = await Problem.findById(problemId);
        if (!problem) return res.status(404).send("Problem not found");

        const contents = Array.isArray(userMessage)
            ? userMessage
            : [{ role: 'user', parts: [{ text: String(userMessage || '') }] }];

        if (!contents.length) {
            return res.status(400).json({ reply: "Message is required" });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });

        // Format testcases for readability
        const formattedTestCases = (problem.testCases || []).map((tc, i) => `
  Example ${i + 1}:
    Input: ${tc.input}
    Output: ${tc.output}
    ${tc.explanation ? `Explanation: ${tc.explanation}` : ''}
`).join('\n');

        const formattedStarterCode = (problem.starterCode || []).map((sc, i) => `
    Starter Code ${i + 1} (${sc.language}):
    ${sc.initialCode}
    `).join('\n');

        const formattedConstraints = (problem.constraints || []).map(c => `- ${c}`).join('\n');
        const formattedTags = (problem.tags || []).join(', ');

        const systemInstruction = `
You are an expert DSA mentor on a competitive programming platform.

The user is currently solving this problem:
------------------------------
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Tags (Topic Hints): ${formattedTags}

Problem Description:
${problem.description}

Constraints:
${formattedConstraints}

Examples:
${formattedTestCases}

Starter Code Snippets:
${formattedStarterCode}
------------------------------

Your behavior rules:
1. ONLY discuss this specific problem or DSA/programming concepts directly related to it.
2. Give HINTS and guiding questions first — do NOT give the full solution unless the user explicitly asks for it multiple times.
3. You can help with:
   - Clarifying the problem statement
   - Choosing the right algorithm or data structure (use Tags as hints)
   - Dry running the examples step by step
   - Debugging code the user shares with you
   - Time & space complexity discussions
4. If asked something unrelated to coding or this problem, redirect:
   "Let's stay focused on '${problem.title}'. What part is tripping you up?"
5. Adjust explanation depth based on the difficulty: 
   - Easy → beginner-friendly, very step by step
   - Medium → assume basic DSA knowledge
   - Hard → assume solid DSA knowledge, go deeper
6. When the user is stuck, ask:
   "What approach have you tried?" or "What does a brute force solution look like to you?"
`;


        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents,
            config: { systemInstruction },
        });


        res.status(201).json({ reply: response.text });

    } catch (err) {
        res.status(500).json({ reply: err.message || String(err) });
    }
};


module.exports = solveDoubt


