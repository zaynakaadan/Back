const express = require("express")

const postRouter = express.Router()

const { getPosts, createPost, createComment, deletePost, updatePost, likePost } = require("../controllers/posts")
const { checkToken } = require("../middleware/token")
const { imageUpload } = require("../middleware/image")

postRouter.use(checkToken)

postRouter.post("/AddComment/:id", createComment)
postRouter.get("/" , getPosts)
postRouter.post("/CreatePost/", imageUpload, createPost)
postRouter.delete("/:id", deletePost)
postRouter.post("/EditCategory/:id", imageUpload, updatePost)
postRouter.get("/LikePost", likePost)

module.exports = { postRouter,  imageUpload}