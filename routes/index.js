const express = require("express");
const bcrypt = require("bcrypt");
const redis = require("redis");
const handlebars = require('handlebars');
const fs = require("fs");

const router = express.Router();


const HOST = "redis-server";
// const HOST = "127.0.0.1";
const DATABASE = 0;

let redisClient = null;

router.get('/login', (req, res)=>{
    let result = '';
    // try{
    //     redisClient = redis.createClient({host: HOST, db: DATABASE});
    //     result = await getData();
    // }
    // catch(err){
    //     result = err; 
    // }

    let source = fs.readFileSync("./templates/login.html");
    let template = handlebars.compile(source.toString());
    let data = {
        table: result
    }
    result = template(data); 
    response.send(result);
});



module.exports = router;