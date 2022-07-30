## Welcome to the application Groupomania p7 !
This is the backend for the Groupomania

### Technologies used
-Node.js, Express, JWT, Multer
-MySQL hosted on PlanetScale
-Prisma for ORM

### How to use

1. `Git clone` this repo
2. `Npm install`
3. Rename the `.env development` file into `.env`
4. Populate it with your personal environment variables:
5. This repo was tested with an online PlanetScale MySQL database

### How to use Prisma to interact with the DB
  
The db schema is inside the `schema.prisma`  

If you want to change it, you have to run `npx prisma db push`