const express = require('express');
const app = express();
var cors = require('cors')

const jwt = require('jsonwebtoken')
const moongose = require('mongoose')
const nodemailer = require('nodemailer')
const dbURL = require('./proprties').DB_URL;


const UserModel = require('./models/users.model')
const UserProfileModel = require('./models/user-profile.model')
const PostsModel = require('./models/posts.model')
const userRouter = require('./routes/users');
const userProfileRouter = require('./routes/user-profile')
const postsRouter = require('./routes/posts')

app.use(cors())



moongose.connect(dbURL);

moongose.connection.on("connected", () => {
    console.log("Connected to MongoDB !");
});
app.use(express.json())
app.use(function (req, res, next) {
    // res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
    // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});


app.use('/api/UsersApi', userRouter);
app.use('/api/userProfile', userProfileRouter);
app.use('/api/posts', postsRouter);



app.get('/getData', (req, res) => {
    res.json({
        "statusCode": 200,
        "statusMessage": "Beauty"
    })
})

const port = process.env.port || 3000;

app.listen(port, () => {
    console.log(`Express API is running at port ${port}...`)
})