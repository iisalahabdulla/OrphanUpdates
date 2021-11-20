require('dotenv').config()
var express = require('express')
const nodemailer = require('nodemailer')
const jwt = require('jsonwebtoken')
var router = express.Router()
var mongoose = require('mongoose')
const md5 = require('md5')

const userModel = require('../models/users.model')
const SendmailTransport = require('nodemailer/lib/sendmail-transport')

//login token
router.post('/login', async (req, res) => {
    try {
        const {
            userName,
            userPassword
        } = req.body;

        const result = await checkCredintials(userName, userPassword)

        // console.log(result);
        if (result.responses == 'True True') {
            const user = {
                userName: userName,
                role: result.userRole
            };

            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            res.json({
                token: accessToken
            })
        } else if (result.responses == 'True False') {
            res.json({
                res: 'True False'
            })
        } else if (result.responses == 'False False') {
            res.json({
                res: 'False False'
            })
        }
    } catch (err) {
        res.send('Error: ' + err)
    }

})


//get all users
router.get('/GetAllEmployees', authinticateToken, async (req, res, next) => {
    try {
        const users = await userModel.find()
        res.json(users)
    } catch (err) {
        res.send('Error ' + err)
    }
})
router.get('/', async (req, res) => {
    try {
        const users = await userModel.find();
        res.json(users)
    } catch (err) {
        res.send('Error: ' + err)
    }
})

//get user by id
router.get('/:id', authinticateToken, async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id)
        res.json(user)
    } catch (err) {
        res.send('Error: ' + err)
    }
})

//get user by name
router.get('/getEmployeeDataByName/:userName', authinticateToken, async (req, res) => {
    try {
        console.log("check");
        const userName = req.params.userName
        const users = userModel.find()
        const user = (await users).filter((ele) => {
            return ele.userName === userName
        })
        console.log(user[0]);

        if (user) res.json(user[0])
        else res.json({
            message: 'user not found'
        })
    } catch (err) {
        res.send('Error: ' + err)
    }

})


//create new user
router.post('/', async (req, res) => {
    const userDoesExist = await userExist(req.body.userName)
    // console.log('User exist: ' + userDoesExist);
    if (!userDoesExist) {
        let newUser = userModel({
            userName: req.body.userName,
            userEmail: req.body.userEmail,
            userPassword: md5(req.body.userPassword),
            validation_code: generateCode(),
            reset_password_code: generateCode(),
            verification_status: false,
            roleName: 'user',
        })
        try {
            const u1 = await newUser.save()
            sendEmail(newUser.userEmail, newUser.validation_code, 'validation_code')
            res.send({
                status: 200,
                message: 'User Added Seccussfully',
                userObj: u1
            })
        } catch (err) {
            res.send('Error: ' + err)
        }
    } else {
        res.send('User already exists !')
    }
})

//editing user
router.patch('/:id', authinticateToken, async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id)

        if (user.validation_code == req.body.validation_code) {
            if (req.body.userPassword) user.userPassword = md5(req.body.userPassword)
            if (req.body.userEmail) user.userEmail = req.body.userEmail
            if (req.body.roleName) user.roleName = req.body.roleName

            //resetting validation_code
            user.validation_code = generateCode()

            const u1 = await user.save()
            res.json(u1)
        } else {
            res.send('validation code is not correct, please try again!')
        }
    } catch (err) {
        res.send('Error: ' + err)
    }
})

//deleting user
router.delete('/:id', authinticateToken, async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id)
        await user.remove()
        res.send({
            data: user
        })
    } catch (err) {
        res.send('Error: ' + err)
    }
})

//resendCode
router.post('/resendCode', async (req, res) => {
    try {
        const userName = req.body.userName
        const users = userModel.find()
        const user = (await users).filter((ele) => {
            return ele.userName === userName
        })
        if (user) {
            if (
                sendEmail(user[0].userEmail, user[0].validation_code, 'validation_code')
            ) {
                res.send(true)
            } else res.send(false)
        } else {
            res.json({
                message: 'user not found.'
            })
        }
    } catch (error) {
        res.send('Error: ' + error)
    }
})

///CheckCredentials
router.post('/CheckCredentials', async (req, res) => {
    try {
        const userName = req.body.userName
        const users = userModel.find()
        const user = (await users).filter((ele) => {
            return ele.userName === userName
        })

        if (user) {
            if (
                user[0].userName === req.body.userName &&
                user[0].userPassword === md5(req.body.userPassword)
            ) {
                if (user[0].verification_status == true) {
                    res.send('True True')
                } else if (user[0].verification_status == false) {
                    res.send('True False')
                }
            }
        } else {
            res.send('False False')
        }
    } catch (err) {
        res.send('Error: ' + err)
    }
})

router.post('/checkCode', async (req, res) => {
    try {
        const userName = req.body.userName
        const users = userModel.find()
        const user = (await users).filter((ele) => {
            return ele.userName === userName
        })

        if (user) {
            if (user[0].validation_code === req.body.validation_code) {
                let id = user[0]._id.toString().split('"')
                id = id[0]
                const updatedUser = await userModel.updateOne({
                    _id: id
                }, {
                    $set: {
                        verification_status: true
                    }
                }, )
                const userS = {
                    userName: user[0].userName,
                    role: user[0].roleName
                };

                const accessToken = jwt.sign(userS, process.env.ACCESS_TOKEN_SECRET)
                // console.log(user);
                res.json({
                    token: accessToken
                })
            } else {
                res.json({
                    res: 'false'
                })
            }
        } else {
            res.send("User doesn't exist.")
        }
    } catch (err) {
        res.send('Error: ' + err)
    }
})

//send reset password code
router.post('/sendResetPassword', async (req, res) => {
    //it will receive username
    try {
        const userName = req.body.userName
        const users = userModel.find()
        const user = (await users).filter((ele) => {
            return ele.userName === userName
        })
        if (user.length > 0) {
            let id = user[0]._id.toString().split('"')
            id = id[0]
            RPCODE = generateCode()
            const updatedUser = await userModel.updateOne({
                _id: id
            }, {
                $set: {
                    reset_password_code: RPCODE
                }
            }, )
            // console.log(updatedUser);
            if (sendEmail(user[0].userEmail, RPCODE, 'reset_password_code'))
                res.json({
                    data: updatedUser
                })
            else res.send(false)
        } else {
            res.json({
                message: 'false'
            })
        }
        // if(generateRestorePasswordCode(user))
    } catch (err) {
        res.send('Error: ' + err)
    }
})

////this method will receive ( userName + New Password + reset_password_code ) to verify he is the owner
router.post('/changePassword', async (req, res) => {
    const userName = req.body.userName
    const users = userModel.find()
    const user = (await users).filter((ele) => {
        return ele.userName === userName
    })

    try {
        if (user[0].reset_password_code === req.body.reset_password_code) {
            let id = user[0]._id.toString().split('"')
            id = id[0]
            const updatedUser = await userModel.updateOne({
                _id: id
            }, {
                $set: {
                    userPassword: md5(req.body.userPassword),
                    reset_password_code: generateCode()
                }
            }, )
            res.json({
                message: 'password updated',
                result: updatedUser
            })
        } else {
            res.json({
                message: "reset code is not correct !"
            })
        }
    } catch (err) {
        res.send('Error: ' + err)
    }

})



//------------------------------------------------------------- Helper Funtions -------------------------------------------------------------

//helper function to generate random numbers
function generateCode() {
    return Math.floor(Math.random() * 1000000 + 1)
}

//send email (validation_code or reset_password code)
async function sendEmail(email, code, type) {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'luigi.boyle89@ethereal.email', // generated ethereal user
            pass: 'c24qf4fp7exV1qag2z', // generated ethereal password
        },
    })

    const text =
        type === 'validation_code' ?
        `Hello, your validation code is: ${code}` :
        `Hello, your reset password code is ${code}`

    const msg = {
        from: '"Fred Foo 👻" <foo@example.com>', // sender address
        to: email, // list of receivers
        subject: 'Hello ✔', // Subject line
        text: text, // plain text body
    }

    // send mail with defined transport object
    let info = await transporter.sendMail(msg)

    console.log('Message sent: %s', info.messageId)
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

//check if user already registered
async function userExist(userName) {
    try {
        let user;
        let bool = false;
        const result = await userModel.find({}, function (err, users) {
            if (err) {
                res.send('Error: ' + err)
                next()
            }
            user = users.filter((ele) => {
                if (ele.userName === userName) bool = true
            })
            // console.log('inside find()' + bool);
        }).clone();
        // console.log('outside find()' + bool);
        return bool
    } catch (err) {
        console.log('Error: ' + err);
    }

}
//check credintials 
async function checkCredintials(userName, userPassword) {
    try {
        const users = userModel.find()
        const user = (await users).filter((ele) => {
            return ele.userName === userName
        })
        console.log(user);
        if (user.length != 0) {
            const response = {
                userRole: user[0].roleName,
                responses: ''
            }
            if (
                user[0].userName === userName &&
                user[0].userPassword === md5(userPassword)
            ) {
                if (user[0].verification_status == true) {
                    response.responses = 'True True'
                    return response
                } else {
                    response.responses = 'True False'
                    return response
                }
            }
        } else {
            const response = {
                userRole: '',
                responses: 'False False'
            }
            return response
        }
    } catch (err) {
        return 'Error: ' + err
    }
}

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