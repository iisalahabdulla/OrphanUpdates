require('dotenv').config()
var express = require('express')
const jwt = require('jsonwebtoken')
var router = express.Router()
var mongoose = require('mongoose')
const multer = require('multer')

const postsModel = require('../models/posts.model')

router.get('/', async (req, res) => {
    const posts = await postsModel.find()
    res.send(posts)
})

router.post('/', authinticateToken, async (req, res) => {
    const {
        post_title,
        postbody,
        Postcongrat,
        employee_name,
        employee_gender,
        employee_email,
        employee_region,
        employee_department,
        Coordinator_name,
        post_Image,
        CategoryId
    } = req.body

    let post = postsModel({
        post_title: post_title,
        postbody: postbody,
        Postcongrat: Postcongrat,
        employee_name: employee_name,
        employee_gender: employee_gender,
        employee_email: employee_email,
        employee_region: employee_region,
        employee_department: employee_department,
        Coordinator_name: Coordinator_name,
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