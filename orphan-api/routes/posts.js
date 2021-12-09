require('dotenv').config()
var express = require('express')
const jwt = require('jsonwebtoken')
var router = express.Router()
var fs = require('fs');
var path = require('path');

const multer = require('multer')

const postsModel = require('../models/posts.model')
var imgModel = require('../models/image.model');

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './postImages')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
})

const upload = multer({
    storage: fileStorageEngine
})



router.get('/', async (req, res) => {
    const posts = await postsModel.find()
    res.send(posts)
})

router.post('/', authinticateToken, async (req, res) => {
    const {
        post_title,
        postbody,
        Postcongrat,
        employee_email,
        CategoryName,
        employee_region,
        post_Image,
        CategoryId
    } = req.body

    let post = postsModel({
        post_title: post_title,
        postbody: postbody,
        Postcongrat: Postcongrat,
        employee_email: employee_email,
        CategoryName: CategoryName,
        employee_region: employee_region,
        post_Image: post_Image,
        CategoryId: CategoryId,
        post_Create_date: Date.now()
    })

    try {
        const p1 = await post.save()
        console.log(p1)
        res.send({
            Status: 200,
            message: 'Post Added Seccussfully !',
            post: p1
        })
    } catch (err) {
        res.send('Error: ' + err)
    }

})

router.post('/UploadFiles', upload.single('img'), (req, res, next) => {
    try {
        var obj = {
            name: req.body.name,
            desc: req.body.desc,
            img: {
                data: fs.readFileSync(path.join('C:\\Users\\ABO_F\\Documents\\Visual Code Projectos\\Graduation project\\My project\\orphan-api\\postImages\\' + req.file.filename)),
                contentType: 'image/png'
            }
        }
        imgModel.create(obj, (err, item) => {
            if (err) {
                console.log(err);
            } else {

                res.json(req.file.filename)
            }
        });
    } catch (err) {
        res.send('Error: ' + err)
    }
})




//helper functions


function authinticateToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)

        req.user = user
        next()
    })

}

module.exports = router