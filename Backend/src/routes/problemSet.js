const express = require('express');
const problremRouter = express.Router();
const userMiddlewere = require('../middlewere/userMiddlewere')
const adminMiddlewere = require('../middlewere/adminMiddlewere')
const { createProblem, updateProblem, deleteProblem, getProblem, getProblemAll, problemSolved, problemSubmissions, getAllTags } = require('../controlers/userProblem')

problremRouter.post('/create', adminMiddlewere, createProblem)
problremRouter.patch('/update/:id', adminMiddlewere, updateProblem);
problremRouter.delete('/delete/:id', adminMiddlewere, deleteProblem);
// problremRouter.delete('/video/:id', adminMiddlewere,);


problremRouter.get('/getProblem/:id', userMiddlewere, getProblem)
problremRouter.get('/allProblem', userMiddlewere, getProblemAll)
problremRouter.get('/problemSolved', userMiddlewere, problemSolved);
problremRouter.get('/submissions/:id', userMiddlewere, problemSubmissions);
problremRouter.get('/allTags', userMiddlewere, getAllTags);


module.exports = problremRouter;