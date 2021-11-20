const mongoose = require('mongoose')

var userSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    userPassword: {
        type: String,
        required: true
    },
    validation_code: {
        type: String,
        required: true
    },
    reset_password_code: {
        type: String,
        required: true
    },
    verification_status: {
        type: Boolean,
        required: true
    },
    roleName: {
        type: String,
        required: true
    }
})

var UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;