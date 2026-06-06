const express = require('express');
const aiRouter = express.Router();
const userMiddlewere = require('../middlewere/userMiddlewere')
const adminMiddlewere = require('../middlewere/adminMiddlewere')
const solveDoubt = require('../controlers/solveDoubt')

aiRouter.post('/chat',userMiddlewere,solveDoubt);

module.exports = aiRouter