var express = require("express");
var bodyparser = require("body-parser");
var upload = require("express-fileupload");
var session=require("express-session");

var user_route = require("./routes/user_route");
var admin_route = require("./routes/admin_route");


var app=express();
app.use(express.static("public/"));
app.use(bodyparser.urlencoded({extended:true}));
app.use(upload());
app.use(express.json());
app.use(session({
    secret:"ThisIsMyFirstDynamicProject",
    saveUninitialized:true,
    resave:true
}));

app.use("/",user_route);
app.use("/admin",admin_route);

var PORT = process.argv.env || 1000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});