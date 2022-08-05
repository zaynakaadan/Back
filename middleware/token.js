//Vérifier si la signature est bonne grace à jwt
const jwt = require("jsonwebtoken")
function checkToken (req,res,next) {
    console.log("checkToken:", checkToken)
    //Récupérer le request headers
    const header = req.header("Authorization")
    //si le header undefined
    if (header == null) return res.status(403)    
        .send({ message: "Missing header" })
    //Je coupe la requête du header pour n'avoir que le TOKEN
    const token = header.split(" ")[1] 
    console.log("token:", token)
    //si le token undefined
    if (token == null) return res.status(403)    
    .send({ message: "Missing token" })       
    //Le TOKEN du header est verify avec la clé secrète
    jwt.verify(token, process.env.SECRET, (err,decoded) => {
        console.log("decoded:", decoded)
        //Si le token est expiré
        if (err) return res.status(403)
            .send({ error: "Token invalid"  })
            req.email = decoded.email//J'ai mis l'email(admin) dans token
        next()
    })
}


module.exports = { checkToken }