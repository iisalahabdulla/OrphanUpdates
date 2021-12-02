const mongoose = require('mongoose')

var userProfileSchema = mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    workingStatus: {
        type: String,
        required: true
    },
    attachedCV: {
        type: String,
        required: true
    }
})

var UserProfileModel = mongoose.model("user-profile", userProfileSchema);

module.exports = UserProfileModel;