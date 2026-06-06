const Problem = require('../models/problem');
const Submission = require('../models/submission');
const User = require('../models/user');
const SolutionVideo = require('../models/solutionVideo');
const { getLanguageId, submitBatch, submitToken, getStatus } = require('../utils/getLanguageId');

const createProblem = async (req, res) => {
    try {
        const { title, slug, description, difficulty, tags,
            constraints, testCases, hiddenTestCases, starterCode,
            solution, createdBy } = req.body;

        for (const { language, solutionCode } of solution) {
            const languageId = getLanguageId(language);

            if (!languageId) {
                return res.status(400).send(`Unsupported language: ${language}`);
            }

            const submissions = testCases.map(({ input, output }) => ({
                source_code: solutionCode,
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

            for (const test of testResult) {
                if (test.status_id != 3) {
                    return res.status(400).send(getStatus(test.status_id));
                }
            }
        }

        await Problem.create({
            ...req.body,
            createdBy: req.result._id
        });

        res.status(201).send("Problem created succesfully");

    } catch (err) {
        res.status(400).send("Error: " + err);
    }



}

const updateProblem = async (req, res) => {
    const { id } = req.params;

    try {
        const { title, slug, description, difficulty, tags,
            constraints, testCases, hiddenTestCases, starterCode,
            solution } = req.body;

        if (!id) {
            return res.status(400).send("Missing ID field");
        }

        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(400).send("Id is not present");
        }

        for (const { language, solutionCode } of solution) {
            const languageId = getLanguageId(language);

            if (!languageId) {
                return res.status(400).send(`Unsupported language: ${language}`);
            }

            const submissions = testCases.map(({ input, output }) => ({
                source_code: solutionCode,
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

            for (const test of testResult) {
                if (test.status_id != 3) {
                    return res.status(400).send(getStatus(test.status_id));
                }
            }
        }

        const updateData = {
            title,
            slug,
            description,
            difficulty,
            tags,
            constraints,
            testCases,
            hiddenTestCases,
            starterCode,
            solution,
        };

        const newProblem = await Problem.findByIdAndUpdate(id, updateData, { runValidators: true, new: true });

        res.status(200).send(newProblem);
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const deleteProblem = async (req, res) => {
    const { id } = req.params;

    try {

        if (!id) {
            return res.status(400).send("Missing ID field");
        }

        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).send("Id is not present");
        }

        await Problem.findByIdAndDelete(id);

        res.status(200).send("Problem Deleted");
    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}




const getProblem = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            return res.status(400).send("Missing ID field");
        }

        const problem = await Problem.findById(id).select('title description difficulty tags constraints testCases hiddenTestCases starterCode solution');



        if (!problem) {
            return res.status(404).send("Id of problem is not present");
        }

        const video = await SolutionVideo.findOne({ problemId: id });

        if (video) {
            const responseData = {
                ...problem.toObject(),
                secureUrl: video.secureUrl,
                thumbnailUrl: video.thumbnailUrl,
                duration: video.duration,
            }

            return res.status(200).send(responseData);
        }


        res.status(200).send(problem);

    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const getProblemAll = async (req, res) => {
    try {
        const allProblem = await Problem.find({}).select('title difficulty tags');
        if (allProblem.length == 0) {
            return res.status(404).send("Problem is missing");
        }
        res.status(200).send(allProblem);

    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const problemSolved = async (req, res) => {
    try {
        const userId = req.result.id;
        const user = await User.findById(userId).populate({
            path: 'problemSolved',
            select: 'title difficulty'
        });

        res.status(200).send(user.problemSolved);

    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}

const problemSubmissions = async (req, res) => {
    try {

        const userId = req.result.id;
        const problemId = req.params.id;

        const ans = await Submission.find({ userId, problemId });



        res.send(ans);



    } catch (err) {
        res.status(500).send("Error: " + err);
    }
}


const getAllTags = async (req, res) => {
    try {
        const tags = await Problem.distinct('tags');
        res.status(200).json(tags);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch tags: ' + err.message });
    }
}

module.exports = { createProblem, updateProblem, deleteProblem, getProblem, getProblemAll, problemSolved, problemSubmissions, getAllTags };