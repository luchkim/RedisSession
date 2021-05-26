const express= require('express');
const fs = require("fs");
const redis = require('redis');
const handlebars = require('handlebars');
const bycrypt = require('bcrypt');
const router = express.Router();


// const HOST = "redis-server";
const HOST = "127.0.0.1";
const DATABASE = 0;

let redisClient = null;

router.get('/login', (req, res)=>{
    redisClient = redis.createClient({host: HOST, db: DATABASE});
    let username = req.cookies.username;
    let userid = req.session.userid;

    let result = buildForm(username, userid, 'login.html')
    res.send(result);
});

router.post('/login', async (req, res)=>{
    redisClient = redis.createClient({host: HOST, db: DATABASE});
    let username = req.body.username;
    let password = req.body.password;
    let userid = authenticateUser(username, password);

    if (userid) {
        req.session.userid = userid;
        result = buildForm(username, userid, 'login.html');
        res.cookie("username", username);
        res.send(result);
    }
    else {
        res.redirect(303, request.originalUrl);
    }
})

router.get('/register', (req, res)=>{
    let username = req.cookies.username;
    let userid = req.session.userid;
    redisClient = redis.createClient({host: HOST, db: DATABASE});

    let result = buildForm(username, userid, 'register.html')
    res.send(result);
});

router.post('/register',  async (req, res)=>{
    try{
        redisClient = redis.createClient({host: HOST, db: DATABASE});
        
        if(req.body.hasOwnProperty('username') && req.body.hasOwnProperty('password')){
            let username = req.body.username.trim();

            if(await userExsists(username)){
                res.redirect('/register')
            }
            else{
                let email = req.body.email;
                let username = req.body.username;
                let password = req.body.password;
                let rePass = req.body.re-password;
                
                let hashed = await generateHash(password);
                console.log(hashed)

                let preD = {
                    email: email,
                    password: hashed
                }

                let data = JSON.stringify(preD);

                if(!await userExsists(username) && password == rePass){
                    console.log('inserting data = ', username, password)
                    let key = await insertData(username, data);
                    console.log(key)
                }
            }
        }
        
    }
    catch(err){
        result = err;
    }

    res.redirect('/login');
})


async function userExsists(username){
    return new Promise((resolve, reject)=>{
        redisClient.exists(username, function (err, key) {
            if(err){
                reject(err)
            }
            else{
                console.log('user exists? = ', key)
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

async function insertData(username, data) {
    return new Promise((resolve, reject)=>{
        redisClient.set(username, data, function(err, key){
            if(err){
                reject(err)
            }
            else{
                console.log('data inserted...')
                resolve(key)
            }
        })
    })
}

async function findUser(key){
    return new Promise((resolve, reject)=>{
        redisClient.get(key, function(err, data) {
            if(err){
                reject('User not exist.. = ', err)
            }
            else{
                console.log('data found: = ', data)
                resolve(data)
            }
        })
    })
}

function buildForm(username, userid, path){
    let cookie = !!username;
    let session = !!userid;
    if (username && userid) {
        welcome = "Welcome back " + username + "! You are logged in.";
    }
    else if (username) {
        welcome = "Welcome back " + username + "! Please log in.";
    }
    else {
        welcome = "Welcome! Please log in.";
    }

    let source = fs.readFileSync("./templates/" + path);
    let template = handlebars.compile(source.toString());
    let data = {
        cookie: cookie,
        session: session,
        welcome: welcome,
        username: username
    }
    result = template(data);
    return result
}

async function authenticateUser(username, password) {
    await findUser(username).then(user=>{
        let users = JSON.parse(user);

        if (users.username == username) {
            if (bcrypt.compareSync(password, users.password)) {
                // Should track successful logins
                return users.userid;
            }
        }   
        return null;
    })
    .catch(err=>{console.log(err)});

}










module.exports = router; 