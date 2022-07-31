const express = require("express")

const postRouter = express.Router()

const { getPosts, createPost, createComment, deletePost, editPost } = require("../controllers/posts")
const { checkToken } = require("../middleware/token")
const { imageUpload } = require("../middleware/image")

postRouter.use(checkToken)

postRouter.post("/:id", createComment)
postRouter.get("/" , getPosts)
postRouter.post("/", imageUpload, createPost)
postRouter.delete("/:id", deletePost)
postRouter.put("/:id", editPost)

module.exports = { postRouter,  imageUpload}