const express = require('express');
const userMiddlewere = require('../middlewere/userMiddlewere')
const submitRouter = express.Router();
const {submitCode,runCode} = require('../controlers/userSubmission')
const { codeExecutionLimiter } = require('../middlewere/rateLimitMiddlewere')


submitRouter.post('/run/:id', userMiddlewere, codeExecutionLimiter, runCode);
submitRouter.post('/submit/:id', userMiddlewere, codeExecutionLimiter, submitCode);

module.exports = submitRouter;
