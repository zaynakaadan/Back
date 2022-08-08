
const {prisma} = require("../db/db.js")
const fs = require("fs-extra")
//Cette fonction va envoyer une array avec 3posts
async function getPosts (req, res) {
console.log("req.email:", req.email)//Voir l 'email dans token
    const email = req.email// Il va m'envoyer Si l'utilisateur oui ou non se loger
    try {   
        const user = await prisma.user.findUnique({where: {email}})
    
        //Récupère la list des posts du plus récents aux plus ancien avec User    
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
            fans:{
               include: {
                    user: {
                        select: {
                            email: true
                        }
                    }
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
        })
        
        console.log("posts:", posts)
        res.send({posts, user})
    }catch(err){
        res.status(500).send({ error: "Utilisateur introuvable"}) 
    }
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
console.log("req.params.id:", req.params.id)
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
const isAdmin  = req.email
const email = req.email
if (email !== post.user.email && isAdmin === 1){
    return res.status(403).send({error: "You are not the owner of this post"})
}
if (post.imageUrl !== null) {
    const filename = post.imageUrl.split("/uploads/")[1];
    await fs.unlink(`uploads/${filename}`);
    }
await prisma.comment.deleteMany({where: {postId}})
await prisma.post.delete({where: { id: postId}})
res.send ({message: "post deleted"})
} catch(err) { 
res.status(500).send({error: "Something went wrong"})
}
}

async function updatePost (req,res){
    const postId =Number(req.params.id)
    //const postId =Number(req.body.id)
    let content = req.body.content
    const hasImage = req.file != null
    console.log("hasImage:",hasImage )
    let url = hasImage ? createImageUrl(req) : ""
    console.log("req.params.id:", req.params.id)
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
        if (post == null) {
            return  res.status(404).send({error: "Post not found"})
        } 
        const isAdmin  = req.email    
        const email = req.email
        if (email !== post.user.email && isAdmin === 1){
            return res.status(403).send({error: "You are not the owner of this post"})
        } 

        if(url !== "")
        {
            const filename = post.imageUrl.split("/uploads/")[1];
            await fs.unlink(`uploads/${filename}`);
        }else{
            url = post.imageUrl;
        }
        if(content !== "")
        {
            url = post.imageUrl;
        }else{
            content = post.content;
        }


        await prisma.post.update({ where: { id: postId},
            data: {
                content: content,
                imageUrl: url
            }
        })
        res.send ({message: "post updated"})     
    }catch (error) {
        res.status(400).json({
            error: error.message,
        });

    }

} 
async function likePost (req,res){
    const userId =Number(req.query.userId)
    const postId =Number(req.query.postId)

    
    try {
        const fan = await prisma.fan.findFirst({
            where: {
                userId: userId,
                postId: postId
            } 
        })
        
        if (fan != null) {
            return  res.status(404).send({error: "Vous avez déjà liké ce poste"})
        }  
        const result = await prisma.fan.create({data:{postId:postId, userId:userId}})  
        
        const nbrFans = await prisma.fan.count({})
        res.send({ nbrFans : nbrFans })
    } catch(err) { 
        res.status(500).send({error: "Something went wrong"})
    }
}






module.exports = {getPosts, createPost,  createComment, deletePost, updatePost,  likePost}

