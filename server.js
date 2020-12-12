var express = require("express");
var app = express();
var path = require("path");
const bcrypt=require('bcryptjs');
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
var sessions = require("client-sessions");
var nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
var Schema = mongoose.Schema;

var HTTP_PORT = process.env.PORT || 8080;
const config = require("./js/config");
const connectionString = config.database_connection_string;

app.engine('.hbs', hbs({extname: '.hbs',defaultLayout: false}));
app.set('view engine', '.hbs');

app.use(sessions({
    cookieName: 'session', 
    secret: 'assignment', 
    duration: 5 * 60 * 1000,
    activeDuration: 1000 * 60  
  }));

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true ,useCreateIndex:true});

mongoose.connection.on("open", () => {
  console.log("Database connection open.");
});
const userSchema = new mongoose.Schema({
    "email":  {
      "type": String,
      "unique": true
    },
    "firstname": String,
    "lastname": String,
    "password":  String,
    "admin": Boolean
  });
  const User = mongoose.model("users", userSchema);

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
app.get("/dashboard", function(req,res){
    res.render('dashboard',{layout: false});
});
app.post("/dashboard", function(req,res){
    bcrypt.hash(req.body.password, 10).then(hashedpass=>{
        const newUser=new User({
            email:req.body.email,
            password:hashedpass,
            firstname:req.body.firstname,
            lastname:req.body.lastname
        })
        newUser.save().then(function(){
            req.session.user={
             email:req.body.email,
             firstname:req.body.firstname,
            lastname:req.body.lastname
            }

          res.render('dashboard', {user:req.session.user});
        })
    })
});

app.get("/", function(req,res){
    res.render('index',{layout: false});
});

app.get("/register", function(req,res){ 
    res.render('register.hbs',{layout: false});
});

app.get("/upload", function(req,res){ 
    res.render('uploadPage.hbs',{layout: false});
});
app.get("/rooms", function(req,res){ 
    res.render('roomListings.hbs',{layout: false});
});
app.get("/details", function(req,res){ 
    res.render('detailsPage.hbs',{layout: false});
});
app.get("/signin", function(req,res){ 
    res.render('signin',{layout: false});
});
app.post("/signin", function(req,res){ 
  User.findOne({email:req.body.email})
  .exec().then((user)=>{
     let errors ="";
     if(user == null){
        errors="Sorry, your email and/or password is incorrect";
        res.render("signin",{
           errors:errors
        })
     } else {
        bcrypt.compare(req.body.password, user.password)
        .then(isMatched=>{
           if(isMatched){
              req.session.user={
                email:user.email,
                firstname:user.firstname,
                lastname:user.lastname
              }
              res.render("dashboard",  {user:req.session.user});
           } else {
              errors="Sorry, your email and/or password is incorrect";
              res.render("signin", {
                 errors:errors
              });
           }
        })
        .catch(err=>console.log(`Error ${err}`));
     }
  });
});


app.use(express.static('views'));
app.use(express.static("public"));



app.listen(HTTP_PORT, onHttpStart);



/*
TODO:
1.login-bcrypt compare-find record in db
2. logout-if(!req.session.user) in login to render login, else redirect logout
3. add bool admin to schema and drop collection!!!!!!
4. during registration, server side validation for email if exists or not using find as in login
4th assignemnt: admin dashboard if(req.session.user.admin(bool) redirect admin dashboard, else dashboard)
!doctype html>
<html>
  <head>
    <style>
      input {
        margin: 4px;
        width: 250px;
      }
    </style>
  </head>
  <body>
    <h1>Week 5 example</h1>
    <p>Register a new user:</p>
    <div style="text-align:right;width:400px;border:1px dashed #6495de;padding:16px;">
      <form>
        <label for="name">Name</label>
        <input id="name" type="text" name="name"/><br />
        <label for="username">Username</label>
        <input id="username" type="text" name="username"/><br />
        <label for="email">Email</label>
        <input id="email" type="email" name="email"/><br />
        <label for="password">Password</label>
        <input id="password" type="password" name="password"/><br />
        <label for="photo">Photo ID</label>
        <input id="photo" type="file" name="photo"/><br />
        <input type="submit" value="Submit File" />
      </form>
    </div>
  </body>
</html>
post-add room
new schema for room ------------------------- assign id, autoincrement
room model.save
for room for photos name of file save in db 
images in handlebar
get/room find all records, assign to variable(array)=>pass to rooms.hbs
#each
for search findAll({location:req.body.location}) /rooms
parameter /room/id=1                                            req.params.id
*/