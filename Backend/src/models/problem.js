const mongoose = require('mongoose');
const { Schema } = mongoose;

const problemSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },

    slug: {
        type: String,
        required: true,
        unique: true,
    },

    description: {
        type: String,
        required: true,
    },

    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        required: true,
    },

    tags: [
        {
            type: String,
        }
    ],

    constraints: [
        {
            type: String,
        }
    ],

    testCases: [
        {
            input: {
                type: String,
                required: true,
            },
            output: {
                type: String,
                required: true,
            },
            explanation: {
                type: String,
            }
        }
    ],

    hiddenTestCases: [
        {
            input: {
                type: String,
                required: true,
            },
            output: {
                type: String,
                required: true,
            },
        }
    ],

    starterCode: [
        {
            language: {
                type: String,
                required: true,
            },
            initialCode: {
                type: String,
                required: true,
            }

        }
    ],

    solution: [
        {
            language: {
                type: String,
                required: true,
            },
            solutionCode: { 
                type: String,
                required: true,
            }

        }
    ],

    // functionName: {
    //     type: String,
    //     required: true,
    // },

    // arguments: [
    //     {
    //         name: String,
    //         type: String,
    //     }
    // ],

    // returnType: {
    //     type: String,
    // },

    // constraints: {
    //     type: String,
    // },

    // hints: [
    //     {
    //         type: String,
    //     }
    // ],

    // editorial: {
    //     type: String,
    // },

    // acceptanceRate: {
    //     type: Number,
    //     default: 0,
    // },

    // submissions: {
    //     type: Number,
    //     default: 0,
    // },

    // likes: {
    //     type: Number,
    //     default: 0,
    // },

    // dislikes: {
    //     type: Number,
    //     default: 0,
    // },

    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    }

}, {
    timestamps: true,
});

const Problem = mongoose.model('Problem', problemSchema);

module.exports = Problem;