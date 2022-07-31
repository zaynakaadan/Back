//Le hash pour le password "*****":
const user1 = { email: "zk10-91@hotmail.com", password:"$2b$10$gt99mYCFyRsAUOr/2aylme1YEF/UWkncfCTgwfXC7vBHrb9BVgcQm" }
const user2 = { email: "michel@hotmail.com", password:"$2b$10$gt99mYCFyRsAUOr/2aylme1YEF/UWkncfCTgwfXC7vBHrb9BVgcQm" }
const users = [user1, user2]


const  { PrismaClient } = require ('@prisma/client')
const prisma = new PrismaClient()

module.exports = { users, prisma }