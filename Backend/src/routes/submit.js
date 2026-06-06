const express = require('express');
const userMiddlewere = require('../middlewere/userMiddlewere')
const submitRouter = express.Router();
const {submitCode,runCode} = require('../controlers/userSubmission')


submitRouter.post('/run/:id',userMiddlewere,runCode);
submitRouter.post('/submit/:id',userMiddlewere,submitCode);

module.exports = submitRouter;
