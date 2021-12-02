require('dotenv').config()
var express = require('express')
const jwt = require('jsonwebtoken')
var router = express.Router()
var mongoose = require('mongoose')
const multer = require('multer')

const userProfileModel = require('../models/user-profile.model')

const fileStorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '--' + file.originalname)
    }
})

const upload = multer({
    storage: fileStorageEngine
})

router.post('/profile', async (req, res) => {
    const {
        userName,
        fullName,
        age,
        workingStatus,
        attachedCV
    } = req.body
    let newUserProfile = userProfileModel({
        userName: userName,
        fullName: fullName,
        age: age,
        workingStatus: workingStatus,
        attachedCV: attachedCV
    })

    try {
        const u1 = await newUserProfile.save()
        console.log(u1);
        res.send({
            status: 200,
            message: 'User Added Seccussfully',
            userObj: u1
        })
    } catch (err) {
        res.send('Error: ' + err)
    }
})

router.post('/upload', upload.single('pdf'), (req, res) => {
    res.json(req.file)
})


router.get('/allUserProfiles', authinticateToken, async (req, res) => {
    const userProfiles = await userProfileModel.find()
    res.send(userProfiles)
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