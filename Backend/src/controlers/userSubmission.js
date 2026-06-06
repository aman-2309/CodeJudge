const Submission = require('../models/submission')
const Problem = require('../models/problem')
const User = require('../models/user')
const { getLanguageId, submitBatch, submitToken, getStatus } = require('../utils/getLanguageId')

const submitCode = async (req, res) => {
    try {
        const userId = req.result.id;
        const problemId = req.params.id;
        const { sourceCode, language } = req.body;

        if (!userId || !problemId || !sourceCode || !language) {
            return res.status(400).send("Some field missing");
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(400).send("Wrong problem id");
        }

        const submittedResult = await Submission.create({
            userId,
            problemId,
            sourceCode,
            language,
            status: 'Pending',
            totalTestCases: problem.hiddenTestCases.length,
        })

        const languageId = getLanguageId(language);

        if (!languageId) {
            return res.status(400).send(`Unsupported language: ${language}`);
        }

        const submissions = problem.hiddenTestCases.map(({ input, output }) => ({
            source_code: sourceCode,
            language_id: languageId,
            stdin: input,
            expected_output: output
        }));

        const submitResult = await submitBatch(submissions);

        if (!Array.isArray(submitResult)) {
            return res.status(400).send('Failed to create submissions on Judge0');
        }

        const resultToken = submitResult.map((value) => value.token);

        if (resultToken.length === 0 || resultToken.some((token) => !token)) {
            return res.status(400).send('Judge0 did not return valid submission tokens');
        }

        const testResult = await submitToken(resultToken);

        let passedTestCases = 0;
        let runTime = 0;
        let memory = 0;
        let status = 'Accepted';
        let errorMessage = null;

        console.log(testResult);

        for (const test of testResult) {
            if (test.status_id == 3) {
                passedTestCases++;
                runTime += parseFloat(test.time);
                memory = Math.max(memory, test.memory);
            } else {
                status = getStatus(test.status_id);
                errorMessage = test.stderr;

            }
        }

        submittedResult.passedTestCases = passedTestCases;
        submittedResult.runTime = runTime;
        submittedResult.memory = memory;
        submittedResult.status = status;
        submittedResult.errorMessage = errorMessage;

        await submittedResult.save();


        req.result.submissions.push(submittedResult._id);
        await req.result.save();

        if (status === 'Accepted') {
            if(!req.result.problemSolved.includes(problemId)){
                req.result.problemSolved.push(problemId);
                await req.result.save();
            }
        }

        res.status(201).send(submittedResult);
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const runCode = async (req, res) => {
    try {
        const userId = req.result.id;
        const problemId = req.params.id;
        const { sourceCode, language } = req.body;

        if (!userId || !problemId || !sourceCode || !language) {
            return res.status(400).send("Some field missing");
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(400).send("Wrong problem id");
        }

        const languageId = getLanguageId(language);

        if (!languageId) {
            return res.status(400).send(`Unsupported language: ${language}`);
        }

        const submissions = problem.testCases.map(({ input, output }) => ({
            source_code: sourceCode,
            language_id: languageId,
            stdin: input,
            expected_output: output
        }));

        const submitResult = await submitBatch(submissions);

        if (!Array.isArray(submitResult)) {
            return res.status(400).send('Failed to create submissions on Judge0');
        }

        const resultToken = submitResult.map((value) => value.token);

        if (resultToken.length === 0 || resultToken.some((token) => !token)) {
            return res.status(400).send('Judge0 did not return valid submission tokens');
        }

        const testResult = await submitToken(resultToken);

        res.status(201).send(testResult);
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

module.exports = {submitCode,runCode};