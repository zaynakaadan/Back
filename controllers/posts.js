const {prisma} = require("../db/db.js")

//Cette fonction va envoyer une array avec 3posts
async function getPosts (req, res) {
console.log("req.email:", req.email)//Voir l 'email dans token
    const email = req.email// Il va m'envoyer Si l'utilisateur oui ou non se loger
    const posts= await prisma.post.findMany({
    include: {
        user:{
            select: {
                email: true
            }
        },
        comments:{
            orderBy: {
                createdAt: "asc"
            },
            include: {
                user: {
                    select: {
                        email: true
                    }
                }
            }
        },
    },
    orderBy: {
        createdAt: "desc"
    }
    })
    console.log("posts:", posts)
    res.send({ posts, email })
}

async function createPost (req, res) {        
    const content = req.body.content
    const hasImage = req.file !=null
    console.log("hasImage:",hasImage )
    const url = hasImage ? createImageUrl(req) : ""
    const email = req.email
    try {   
    const user = await prisma.user.findUnique({where: {email}})
    const userId = user.id
    console.log("userId:", userId)    
    const post = { content,  userId,  imageUrl:url}
    console.log("post:", post)
    const result = await prisma.post.create({data:post})  
    console.log("result:",result )  
    post.unshift(post)
    res.send({ post: result })
}catch(err){
    res.status(500).send({ error: "Something went wrong"}) 
}
}

function createImageUrl(req) {
    let pathToImage = req.file.path.replace("\\", "/")
    const protocol = req.protocol
    const host = req.get("host")
    return `${protocol}://${host}/${pathToImage}`
}

async function createComment (req,res) {       
const postId = Number(req.params.id)
const post = await prisma .post.findUnique({
    where: { id: postId},
    include: {
        user: {
            select: {
                id: true
            }
        }
    }
})
console.log("post:", post)
if (post == null) {
    return res.status(404).send({ error: "Post not found" })
    }
const userCommenting = await prisma.user.findUnique({
    where: {email: req.email}
})    
const userId = userCommenting.id
const commentToSend = {userId, postId, content:req.body.comment}
console.log("commentToSend:", commentToSend)
const comment = await prisma.comment.create({data: commentToSend})
res.send({comment})
}

async function deletePost (req,res){
const postId =Number(req.params.id)
try {
const post = await prisma.post.findUnique({
    where: {
        id: postId
    },
    include: {
        user: {
            select :{
                email: true
            }
        }
    }
})
console.log("post:", post)
if (post == null) {
    return  res.status(404).send({error: "Post not found"})
}
const email = req.email
if (email !== post.user.email){
    return res.status(403).send({error: "You are not the owner of this post"})
}
await prisma.comment.deleteMany({where: {postId}})
await prisma.post.delete({where: { id: postId}})
res.send ({message: "post deleted"})
} catch(err) { 
res.status(500).send({error: "Something went wrong"})
}
}

async function modifyPost (req,res){
    const post = {
        content: req.body.content,
      };
      if (req.file) {
        post.image = `${req.protocol}://${req.get("host")}/images/${req.file.filename}`;
      } else if (req.body.image === "delete") {
        post.image = "";
      }
      await prisma.post.update(post, {
        where: { id: req.params.id },
        returning: true, //Option Sequelize qui permet de retourner le post
        plain: true,
      })
        .then(() => res.status(200).json({ message: "post modified" }))
        .catch((err) => res.status(404).json({ err }));
    };
    


    /*const postId =Number(req.params.id)
    const content = req.body.content
    console.log("content:", content)
    const hasImage = req.file !=null
    console.log("hasImage:",hasImage )
    const url = hasImage ? createImageUrl(req) : ""
    const email = req.email
    try {   
    const user = await prisma.user.findUnique({where: {postId}})
    const userId = user.id
    console.log("userId:", userId) 
    
    const post = {  content,  userId, imageUrl:url }
    console.log("post:", post)
    const result = await prisma.post.update({ data:post})  
    console.log("result:",result )  
    //post.unshift(post)
    res.send({ message: "post updated" })
}catch(err){
    res.status(500).send({ error: "Something went wrong"}) 
}*/




/*    try {
        let newImageUrl;
        //const userId = token.getUserId(req);
        let post = await prisma.post.findOne({ where: { id: postId } });
        
        if (userId === post.UserId) {
          if (req.file) {
            newImageUrl = `${req.protocol}://${req.get("host")}/api/uploads/${
              req.file.filename
            }`;
            if (post.imageUrl) {
              const filename = post.imageUrl.split("/uploads")[1];
              fs.unlink(`uploads/${filename}`, (err) => {
                if (err) console.log(err);
                else {
                  console.log(`Deleted file: uploads/${filename}`);
                }
              });
            }
          }
          if (req.body.message) {
            post.message = req.body.message;
          }
          post.link = req.body.link;
          post.imageUrl = newImageUrl;
          const newPost = await prisma.post.save({
            fields: ["message", "link", "imageUrl"],
          });
          res.status(200).json({ newPost: newPost, messageRetour: "post modifié" });
        } else {
          res.status(400).json({ message: "Vous n'avez pas les droits requis" });
        }
      } catch (error) {
        return res.status(500).send({ error: "Erreur serveur" });
      }*/
    
   

    /*const postId =Number(req.params.id)

    const post = await prisma.post.findUnique({
        where: {
            id: postId
        },
})
console.log("post:", post)
if (post == null) {
    return  res.status(404).send({error: "Post not found"})
}
const email = req.email
if (email !== post.user.email){
    return res.status(403).send({error: "You are not the owner of this post"})
}
if (!req.file) {
    return  prisma.post.updateMany({where: { id: postId}})

.then(() => 
res.status(200).json({
    message: "Updated post"
})
)
.catch((err) => 
res.status(400).json({error: "failed request"})
)
}

}*/
async function likePost (req,res){
    const postId =Number(req.params.id)
    try {
    const post = await prisma.post.findUnique({
        where: {
            id: postId
        },
        
    })
    console.log("post:", post)
    if (post == null) {
        return  res.status(404).send({error: "Post not found"})
    }
    const email = req.email
    if (email !== post.user.email){
        return res.status(403).send({error: "You are not the owner of this post"})
    }    
    await prisma.post.updateMany({where: { id: postId}})
    res.send ({message: "post liked"})
    } catch(err) { 
    res.status(500).send({error: "Something went wrong"})
    }
}






module.exports = {getPosts, createPost,  createComment, deletePost, modifyPost,  likePost}