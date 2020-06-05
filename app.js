var express 	   = require("express"),
	app 		   = express(),
	bodyParser     = require("body-parser"),
	mongoose 	   = require("mongoose"),
	flash          = require("connect-flash"),
	Campground     = require("./models/campgrounds"),
	Comment 	   = require("./models/comments"),
	Review         = require("./models/reviews"),
	User 		   = require("./models/user"),
	passport 	   = require("passport"),
	localStrategy  = require("passport-local"),
	methodOverride = require("method-override"),
	campgrounds    = require("./routes/campgrounds"),
	comments       = require("./routes/comments"),
	index          = require("./routes/index"),
	reviews        = require("./routes/reviews"),
	seedDB 		   = require("./seeds");

require('dotenv').config();

mongoose.connect("mongodb://localhost:27017/yelp_camp", {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");

app.use(require("express-session")({
	secret: "Dark is about to be released",
	resave: false,
	saveUninitialized: false
}));

app.locals.moment = require("moment");

app.use(methodOverride("_method"));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// seedDB();

app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/comments", comments);
app.use("/campgrounds/:id/reviews", reviews);
app.use(index);


app.listen(process.env.PORT || 3000, process.env.IP, function() {
	console.log("YelpCamp Server has started!");
});
