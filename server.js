var express = require("express");
var app = express();
var path = require("path");

var HTTP_PORT = process.env.PORT || 8080;

function onHttpStartup () {
    console.log("Express Server running on port " + HTTP_PORT);
}
app.use(express.static("public"));

app.get("/", function(req, res){
    res.sendFile(path.join(__dirname, "/views/index.html"));
});

app.get("/register", function(req, res){
    res.sendFile(path.join(__dirname, "/views/register.html"));
});

app.get("/upload", function(req, res){
    res.sendFile(path.join(__dirname, "/views/uploadPage.html"));
});

app.get("/rooms", function(req, res){
    res.sendFile(path.join(__dirname, "/views/roomListings.html"));
});

app.get("/details", function(req, res){
    res.sendFile(path.join(__dirname, "/views/detailsPage.html"));
});
app.get("/signin", function(req, res){
    res.sendFile(path.join(__dirname, "/views/signin.html"));
});


app.listen(HTTP_PORT, onHttpStartup);

