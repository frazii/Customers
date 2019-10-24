const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var Schema = mongoose.Schema;
const moment = require('moment');
const bcrypt = require('bcrypt');
const jws = require('jsonwebtoken');


var CustomerSchema = new Schema({
    ID:{
        type:Number,
        required:true,
        unique:true,
        default: parseInt(moment(new Date()).format('mmssSSS'))
    },
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true,
        trim:true
    },
    address:{
        type:String,
        required:true,
    },
    update_timestamp:{
        type:Date,
        default:Date.now()
    }
});

CustomerSchema.methods.GenerateJWTToken = function(callback){
    bcrypt.hash(this.password,10,(err,hashed_pw)=>{
        this.password = hashed_pw;
        this.save()
        .then(result=>{
            console.log(result);
            //res.send(result);
            callback({
                status: "success",
                token: jwt.sign({
                    email: this.email,
                    password: this.password
                },'abc123')
            });
        })
        .catch(err=>{
            //console.log('Exception saving data',err)
            //res.status(400).send(err);
            callback({
                status: "error",
                ErrorDetails: err
            });
        });
    });
};

CustomerSchema.statics.verifyJWTToken = function(token){
    var decoded;
    try {
        decoded = jws.verify(token,'abc123');
        return Promise.resolve(decoded);
    } catch (error) {
        return Promise.reject(error);
    }
};

var Customer = mongoose.model('Customer',CustomerSchema);
module.exports = Customer;