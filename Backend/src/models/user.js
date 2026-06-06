const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    googleId: { type: String, unique: true, sparse: true },
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20
    },

    lastName: {
        type: String,
        minlength: 3,
        maxlength: 20
    },

    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true,
    },

    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },

    password: {
        type: String,
        required: function () {
            return !this.googleId;
        },
    },

    age: {
        type: Number,
        min: 0,
        max: 100,
    },

    role: {
        type: String,
        enum: ["admin", "user"],
        default: "user",
    },

    problemSolved: [
        {
            type: Schema.Types.ObjectId,
            ref: "Problem",
            unique:true
        }
    ],

    submissions: [
        {
            type: Schema.Types.ObjectId,
            ref: "Submission"
        }
    ],

}, {
    timestamps: true,
});

userSchema.post('findOneAndDelete', async function (userInfo) {
    if (userInfo) {
        await mongoose.model('Submission').deleteMany({ userId: userInfo.id });
    }
})

const User = mongoose.model('User', userSchema);

module.exports = User;