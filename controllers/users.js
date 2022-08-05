
// Authentification avec un TOKEN utilisateur unique
const jwt = require("jsonwebtoken")
const {prisma} = require("../db/db.js")
// Module de hash Mot De Passe
const bcrypt = require("bcrypt")
const passwordValidator = require('password-validator') 

let schema = new passwordValidator();

/*  Schéma de validation du MDP pour plus de sécurité  ** 
**  Le MDP doit avoir 6 caractères minimum  **
**  Une taille maximale de 100 caractères **
**  Il doit avoir au moins une majuscule  **
** Il doit avoir un minimum de une minuscule**
**  Un minimum de 1 chiffre **
**  Les espaces ne sont pas autorisés */

schema
.is().min(6)
.is().max(20)
.has().uppercase()
.has().lowercase()
.has().digits()
.has().not().spaces()                         
//Ici sont définies les règles REGEX pour plus de sécurité  
// Pour que l'utilisateur utilise un vrai email pour créer un compte 
const regexEmail =
/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

async function logUser(req, res){
    const {email, password } = req.body
    try {    
    const user = await getuser(email)
    if (user == null) return res.status(404).send({error:"User not found "})
        
const isPasswordCorrect = await checkPassword(user, password)
        if(!isPasswordCorrect) return res.status(401).send({error:"Wrong password"})
        
    const token = makeToken(email)    
    res.status(200).send({token: token , email: user.email})  
} catch(error) { 
    res.status(500).send({error})
}
    }
//Signature du Token
function makeToken (email) {        
    return jwt.sign({ email } ,process.env.SECRET, {expiresIn: "24h"})        
}
    //Data Base
function getuser(email) {
    return prisma.user.findUnique({where: {email}})        
}
//compare le mot de passe dans la base de données (user.password) et le mot de passe qui j'ai reçu(password)
function checkPassword(user, password) {
    return bcrypt.compare(password, user.password)      
}

async function signupUser (req,res) {

const {email, password, confirmPassword } = req.body
console.log("email:", email)
if (!regexEmail.test(email)){
return res.status(400).json({ error: "Email incorrect" })
}
    if (!schema.validate(password)){
        return  res.status(400).json({ error: "your password must have at least 8 characters 1 uppercase character 1 number 1 special character" })
    }
    

    if (confirmPassword == null)
    return res.status(400).send({ error: "Please confirm your password" })

if (password !== confirmPassword) return res.status(400).send({error: "Passwords don't match"})
console.log("confirmPassword:", confirmPassword)
try {
//si l'utilisateur n'est pas dans la base de données
const userInDb = await getuser(email)
if (userInDb != null) return res.status(400).send({error: "users already exists"})
const hash = await hashPassword(password)
const user = await saveUser({email:email, password:hash})           
        res.send({user:user})
        
    }catch(error) { res.status(500).send({error})
    }
}
function saveUser (user){   
    return prisma.user.create({data: user})
}
// La méthode .hash permet de crypter notre mot de passe
function hashPassword (password){
    const saltRounds = 10;  
return bcrypt.hash(password, saltRounds)
}

    
    module.exports = { logUser, signupUser, schema }