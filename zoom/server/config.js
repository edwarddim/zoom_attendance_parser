const express = require('express');
const cookieParser = require('cookie-parser');
var session = require('express-session')

exports.port = 8000;
exports.applyConfiguration = (app) =>{

    app.use(cookieParser());
    app.set('view engine', 'ejs');
    app.use(session({secret: "I solemnly swear i am upto no good!"}))
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.static('static'))

}


