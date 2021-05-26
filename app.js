const express= require('express');
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

const session = require("express-session");
const app = express();

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));
// app.use()

app.use(cookieParser());

app.use(session({
    resave: false, 
    saveUninitialized: false, 
    secret: crypto.randomBytes(16).toString("hex")
}));

app.use('/', require('./routes/index'))


app.listen(8081, console.log('Server Started...'));