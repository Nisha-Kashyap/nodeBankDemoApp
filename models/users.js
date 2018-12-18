let mongoose = require('mongoose')
let usersSchema = new mongoose.Schema({
    fullname: { type: String },
    email: { type: String },   
    password: { type: String },
    balance: {type: Number, default: 0},
    active: { type: Boolean }
})
module.exports = mongoose.model('User', usersSchema)