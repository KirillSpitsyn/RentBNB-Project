var express = require("express");
var app = express();
var path = require("path");
const hbs = require('express-handlebars');
var nodemailer = require('nodemailer');
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))

var HTTP_PORT = process.env.PORT || 8080;

app.engine('.hbs', hbs({extname: '.hbs'}));
app.set('view engine', '.hbs');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'zim197211@gmail.com',
        pass: 'salut2011'
    }
});
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
app.get("/dashboard", function(req,res){
    res.render('dashboard',{layout: false});
});
app.post("/dashboard", function(req,res){
    const FORM_DATA = req.body;
DATA_OUTPUT="<h1>Your have successfully registered!</h1> <br/><br/>" +
       "<h3">Welcome <strong> + FORM_DATA.firstname + " " + FORM_DATA.lastname + "</strong> to the Canada Rentals.</h3>";
    res.send(DATA_OUTPUT);
    var emailOptions = {
        from: 'zima197211@gmail.com',
        to: FORM_DATA.email,
        subject: 'Registration on CanadaRentals',
        html: '<h1>Welcome to CanadaRentals</h1><p>Hello '+ FORM_DATA.firstname+ '</p><p>Thank-you for registration on Canada Rentals.</p>'
    };

    transporter.sendMail(emailOptions, (error, info) => {
        if (error) {
            console.log("ERROR: " + error);
        } else {
            console.log("SUCCESS: " + info.response);
        }
    });

});

app.get("/", function(req,res){
    res.render('index',{layout: false});
});

app.get("/register", function(req,res){ 
    res.render('register',{layout: false});
});

app.get("/upload", function(req,res){ 
    res.render('uploadPage',{layout: false});
});
app.get("/rooms", function(req,res){ 
    res.render('roomListings',{layout: false});
});
app.get("/details", function(req,res){ 
    res.render('detailsPage',{layout: false});
});
app.get("/signin", function(req,res){ 
    res.render('signin',{layout: false});
});


app.use(express.static('views'));
app.use(express.static("public"));



app.listen(HTTP_PORT, onHttpStart);
