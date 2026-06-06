const express = require('express');
const adminMiddleware = require('../middlewere/adminMiddlewere');
const videoRouter = express.Router();
const { generateUploadSignature, saveVideoMetadata, deleteVideo } = require("../controlers/videoSection")

videoRouter.get("/create/:problemId", adminMiddleware, generateUploadSignature);
videoRouter.post("/save", adminMiddleware, saveVideoMetadata);
videoRouter.delete("/delete/:problemId", adminMiddleware, deleteVideo);


module.exports = videoRouter;