var express = require("express");
var app = express();
var path = require("path");
const bcrypt=require('bcryptjs');
const multer = require("multer");
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
var sessions = require("client-sessions");
var nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
var Schema = mongoose.Schema;

var HTTP_PORT = process.env.PORT || 8080;
const config = require("./js/config");
const { Server } = require("http");
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


const roomSchema = new Schema({
  "id":{
    "type":Number,
    "unique":true
  },
  "title": String,
  "price": Number,
  "description": String,
  "location": String,
  "photo": String
});
const Room=mongoose.model("rooms", roomSchema);
const userSchema = new mongoose.Schema({
    "email":  {
      "type": String,
      "unique": true
    },
    "firstname": String,
    "lastname": String,
    "password":  String
  });
  const User = mongoose.model("users", userSchema);
  const adminSchema = new mongoose.Schema({
    "email":  {
      "type": String,
      "unique": true
    },
    "firstname": String,
    "lastname": String,
    "password":  String,
    "isAdmin":{ 
      "type":Boolean,
      "default": true
    }
  });
  const Admin = mongoose.model("admins", adminSchema);
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
const storage = multer.diskStorage({
  destination: "./public/images/",
  filename: function(req, file, fn){
    fn(null, file.originalname);
  }
});
const upload=multer({storage:storage});
app.get("/dashboard", function(req,res){
    res.render('dashboard',{layout: false});
});
app.get("/admindashboard", function(req,res){
  res.render('admindashboard',{layout: false, user: req.session.user,
    data: Room.find({location : req.body.location}).lean()});
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
app.post("/admindashboard", function(req,res){
  bcrypt.hash(req.body.password, 10).then(hashedpass=>{
      const newAdmin=new Admin({
          email:req.body.email,
          password:hashedpass,
          firstname:req.body.firstname,
          lastname:req.body.lastname,
          isAdmin:true
      })
      newAdmin.save().then(function(){
          req.session.admin={
           email:req.body.email,
           firstname:req.body.firstname,
          lastname:req.body.lastname,
          isAdmin:true
          }
        res.render('admindashboard', {admin:req.session.admin});
      })
  })
});
app.post("/addroom", upload.single("photo"),function(req,res){
  var createRoom = new Room({
    id:req.body.ID,
    title: req.body.title,
    price: req.body.price,
    description: req.body.description,
    location: req.body.location,
    photo: req.file.filename
  });
  createRoom.save().then(()=>{
    res.redirect('/rooms');
    res.render('admindashboard')
  });
});
app.post("/updateroom", upload.single("photo"), function(req, res) {
  const rID = req.body.ID;
  const rtitle = req.body.title;
  const rprice = req.body.price;
  const rdescription = req.body.description;
  const rlocation = req.body.location;
  const rphoto = req.body.photo;
  Room.updateOne({id : rID}, {$set: {title : rtitle, price : rprice, description : rdescription, location : rlocation, photo : req.file.filename}})
  .exec()
  .then(() =>{
    res.redirect('/rooms');
  });
});
app.post("/deleteroom", function(req, res) {
  const idnum = req.body.ID;
  Room.deleteOne({id : idnum})
  .exec()
  .then(() => {
    res.redirect('/roomlisting');
  });
});
app.get("/", function(req,res){
    res.render('index',{layout: false});
});
app.get("/adminreg", function(req,res){
  res.render('adminreg',{layout: false});
});
app.get("/register", function(req,res){ 
    res.render('register',{layout: false});
});

app.get("/rooms", function(req,res){ 
  Room.find().exec().then(rooms=>{
    const data=[];
    rooms.forEach(room => {
      data.push({title: room.title, price: room.price, description: room.description, location: room.location, photo: room.photo});
});
    res.render('roomListings', {user:req.session.user, data: data,
      layout: false });
  });
});
app.get("/details", function(req,res){ 
    res.render('detailsPage',{layout: false});
});
app.get("/signin", function(req,res){ 
    res.render('signin',{layout: false});
});
app.get("/logout", function(req,res){ 
  req.session.reset();
  res.redirect("/signin");
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
app.get("/signinadmin", function(req,res){ 
  res.render('signinadmin',{layout: false});
});
app.post("/signinadmin", function(req,res){ 
Admin.findOne({email:req.body.email})
.exec().then((admin)=>{
   let errors ="";
   if(admin == null){
      errors="Sorry, your email and/or password is incorrect";
      res.render("signinadmin",{
         errors:errors
      })
   } else {
      bcrypt.compare(req.body.password, admin.password)
      .then(isMatched=>{
         if(isMatched){
            req.session.admin={
              email:admin.email,
              firstname:admin.firstname,
              lastname:admin.lastname
            }
            res.render("admindashboard",  {admin:req.session.admin});
         } else {
            errors="Sorry, your email and/or password is incorrect";
            res.render("signinadmin", {
               errors:errors
            });
         }
      })
      .catch(err=>console.log(`Error ${err}`));
   }
});
});


app.use(express.static("public"));

app.listen(HTTP_PORT, onHttpStart);



