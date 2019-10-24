const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jws = require('jsonwebtoken');
var db = require('./db/mongoose');
var Customer = require('./models/customer');
var app = express();

const PORT = 3000;

/*
var john = new customer({
    firstname:'John',
    lastname:'Carpentar',
    email:'john@example.com',
    phone:'093131231812',
    address:'15 Palingtown, Udney, 2212'
});
*/

app.use(bodyParser.json());
app.post('/customer/create',(req,res)=>{
    var customer = new Customer(req.body);
    
    customer.GenerateJWTToken((result)=>{
        if(result.status == 'success'){
            res.json(result);
        }
        else{
            res.status(400).send(result.ErrorDetails);
        }
    });
});

app.post('/customerold/create',(req,res)=>{
    var customer = new Customer(req.body);
    bcrypt.hash(req.body.password,10,(err,hashed_pw)=>{
        customer.password = hashed_pw;
        customer.save()
        .then(result=>{
            console.log(result);
            //res.send(result);
            res.json({
                status: "success",
                token: jwt.sign({
                    email: customer.email,
                    password: customer.password
                },'abc123')
            });
        })
        .catch(err=>{
            console.log('Exception saving data',err)
            res.status(400).send(err);
        });
    });
});

app.get('/customers',(req,res)=>{
    Customer.verifyJWTToken(req.header('X-Auth'))
    .then(result=>{
        return Customer.find({});
    })
    .then(result => res.status(200).send(result))
    .catch(err => res.status(200).send(err));
});

app.get('/customers/:id',(req,res)=>{
    Customer.verifyJWTToken(req.header('X-Auth'))
    .then(result=>{
        return Customer.findOne({"ID":req.params.id})
    })
    .then(result => res.status(200).send(result))
    .catch(err => res.status(200).send(err));
});

app.patch('/customers/:id',(req,res)=>{
    req.body.update_timestamp = Date.now();
    Customer.verifyJWTToken(req.header('X-Auth'))
    .then(result=>{
        return Customer.findOneAndUpdate({"ID":req.params.id},req.body)
    })
    .then(result => res.status(200).send(result))
    .catch(err => res.status(200).send(err));
});

/*
john.save()
.then(result=>console.log(result))
.catch(err=>console.log('Exception saving data',err));
*/

app.listen(PORT,()=>{
    console.log('Express listening on: ',PORT);
});