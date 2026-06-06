const mongoose = require('mongoose');
const { Schema } = mongoose;

const submissionSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    },

    problemId: {
        type: Schema.Types.ObjectId,
        ref: "problem",
        required: true,
    },

    language: {
        type: String,
        enum: ["C++", "Python", "Java", "Javascript"],
        required: true,
    },
    sourceCode: {
        type: String,
        required: true,
    },

    status: {
        type: String,
        enum: [
            "Pending",
            "Accepted",
            "Wrong Answer",
            "Time Limit Exceeded",
            "Compilation Error",
            "Runtime Error"
        ],
        default: "Pending",
    },

    runTime: {
        type: Number, // in ms
        default: 0,
    },

    memory: {
        type: Number, // in KB
        default: 0,
    },

    errorMessage: {
        type: String,
        default: '',
    },

    passedTestCases: {
        type: Number,
        default: 0
    },

    totalTestCases: {
        type: Number,
        default: 0
    },


}, {
    timestamps: true,
});

submissionSchema.index({userId:1,problemId:1});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;





//

// tokens: [
//     {
//         type: String
//     }
// ],

// testCaseResults: [
//     {
//         input: String,
//         expectedOutput: String,
//         stdout: String,
//         status: String
//     }
// ],