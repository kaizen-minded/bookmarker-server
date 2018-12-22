'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const userSchema = mongoose.Schema({
    firstName: {type: String, default: ""},
    lastName: {type: String, default: ""},
    email: {
        type: String,
        unique: true,
        required: true
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
})

userSchema.methods.serialize = function () {
    return {
        id: this._id || '',
        username: this.username || '',
        firstName: this.firstName || '',
        lastName: this.lastName || ''
    };
};
userSchema.methods.validatePassword = function (password){
    return bcrypt.compare(password, this.password);
};

userSchema.statics.hashPassword = function(password) {
    return bcrypt.hash(password, 10);
}

let User = mongoose.model('User', userSchema);

module.exports ={ User }