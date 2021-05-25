const express= require('express');
const cookieParser = require("cookie-parser");
const fs = require("fs");
const redis = require('redis');
const handlebars = require('handlebars');
const bycrypt = require('bcrypt');

const session = require("express-session");
const app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));
// app.use()

// const HOST = "redis-server";
const HOST = "127.0.0.1";
const DATABASE = 0;

let redisClient = null;

app.get('/login', (req, res)=>{
    let result = '';

    let source = fs.readFileSync("./templates/login.html");
    let template = handlebars.compile(source.toString());
    let data = {
        table: result
    }
    result = template(data); 
    res.send(result);
});

app.post('/login', (req, res)=>{
    console.log(req.body);

    let result = '';
    try{
        redisClient = redis.createClient({host: HOST, db: DATABASE});
        
        if(req.body.hasOwnProperty('username') && req.body.hasOwnProperty('password')){
            let username = req.body.username.trim();
        }
    }
    catch(err){
        result = err;
    }

})

app.get('/register', (req, res)=>{
    let result = '';

    let source = fs.readFileSync("./templates/register.html");
    let template = handlebars.compile(source.toString());
    let data = {
        table: result
    }
    result = template(data); 
    res.send(result);
});

app.post('/register',  async (req, res)=>{
    console.log(req.body);

    let result = '';
    try{
        redisClient = redis.createClient({host: HOST, db: DATABASE});
        
        if(req.body.hasOwnProperty('username') && req.body.hasOwnProperty('password')){
            let username = req.body.username.trim();

            if(await userExsists(username)){
                res.redirect('/register')
            }
            else{
                
                let username = req.body.username;
                let password = req.body.password;
                let rePass = req.body.re-password;
                
                let preD = {
                    username: username,
                    password: await generateHash(password)
                }

                let data = JSON.stringify(preD);

                if(!await userExsists(username) && password == rePass){
                    await insertData(username, data)
                }

            }
        }
        
    }
    catch(err){
        result = err;
    }

})


async function userExsists(username){
    return new Promise((resolve, reject)=>{
        redisClient.exists(username, function (err, key) {
            if(err){
                reject(err)
            }
            else{
                resolve(key)
            }
        })
    })
}

async function generateHash(pass) {
    let salt = bcrypt.getSaltSync();
    let hashed = bycrypt.hashSync(pass, salt);

    return hashed;
}
app.listen(3000, console.log('Server Started...'));