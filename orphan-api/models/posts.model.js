const mongoose = require('mongoose')

var postsSchema = mongoose.Schema({
    post_title: {
        type: String,
        required: true
    },
    postbody: {
        type: String,
        required: true
    },
    Postcongrat: {
        type: String,
        required: true
    },
    employee_name: {
        type: String,
        required: false
    },
    employee_gender: {
        type: String,
        required: false
    },
    employee_email: {
        type: String,
        required: true
    },
    employee_region: {
        type: String,
        required: true
    },
    employee_department: {
        type: String,
        required: false
    },
    CategoryName: {
        type: String,
        required: true
    },
    post_Create_date: {
        type: Date,
        required: false
    },
    Coordinator_name: {
        type: String,
        required: false
    },
    post_Image: {
        type: String,
        required: false
    },
    post_numberOfDownloads: {
        type: Number,
        required: false
    },
    post_numberOfShares: {
        type: Number,
        required: false
    },
    CategoryId: {
        type: Number,
        required: false
    },
})

var PostsModel = mongoose.model("posts", postsSchema);

module.exports = PostsModel;