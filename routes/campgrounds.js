var express    = require("express");
var router     = express.Router();
var Campground = require("../models/campgrounds"); 
var Comment    = require("../models/comments"); 
var Review     = require("../models/reviews");
var middleware = require("../middleware");
var multer 	   = require('multer');
var storage    = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});

require('dotenv').config();

var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'djqbdsvcg', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//=====================
// Campground Routes
//=====================

router.get("/", function(req, res) {
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({name: regex}, function(err, allCampgrounds) {
			if (err) {
				console.log(err);
			} else {
				res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"});
			}
		});	
	} else {
		Campground.find({}, function(err, allCampgrounds) {
			if (err) {
				console.log(err);
			} else {
				res.render("campgrounds/index", {campgrounds: allCampgrounds, page: "campgrounds"});
			}
		});	
	}
});

router.post("/", middleware.isLoggedIN, upload.single('image') , function(req, res) {
  cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      // add cloudinary url for the image to the campground object under image property
      req.body.campground.image = result.secure_url;
      // add image's public_id to campground object
      req.body.campground.imageId = result.public_id;
      // add author to campground
      req.body.campground.author = {
        id: req.user._id,
        username: req.user.username
      }
      Campground.create(req.body.campground, function(err, campground) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        res.redirect('/campgrounds/' + campground.id);
      });
    });
});

router.get("/new", middleware.isLoggedIN, function(req, res) {
	res.render("campgrounds/new");
});

router.get("/:id", function(req, res) {
	Campground.findById(req.params.id).populate("comments").populate({
		path: "reviews",
		options: {sort: {createdAt: -1}}
	}).exec(function(err, campground) {
		if (err) {
			console.log(err);
			req.flash("error", "Item not found");
			res.redirect("/campgrounds");
		} else {
			res.render("campgrounds/show",{campground:campground})
		}
	});
});

// Edit Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		if (err) {
			console.log(err);
			req.flash("error", "Item not Found");
			res.redirect("/campgrounds");
		} else {
			res.render("campgrounds/edit", {campground: foundCampground});
		}
	});
});

// Update Route
router.put("/:id", middleware.checkCampgroundOwnership, upload.single('image'), function(req, res) {
	Campground.findById(req.params.id, async function(err, foundCampground) {
		if (err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
		if (req.file) {
			try {
			await cloudinary.v2.uploader.destroy(foundCampground.imageId);
			var result = await cloudinary.v2.uploader.upload(req.file.path);
			foundCampground.imageId = result.public_id;
			foundCampground.image   = result.secure_url;
			
		} catch(err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
		}
		foundCampground.name = req.body.updatedCampground.name;
		foundCampground.description = req.body.updatedCampground.description;
		foundCampground.price = req.body.updatedCampground.price;
		foundCampground.save();
		req.flash("success", "Campground Updated Successfully");
		res.redirect("/campgrounds/"+foundCampground._id);
	});
});


// Destroy Route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		if (err) {
			req.flash("error", err.message);
			return res.redirect("back");
		}
		Comment.remove({"_id": {$in: foundCampground.comments}}, function(err) {
			if (err) {
				req.flash("error", err.message);
				return res.redirect("back");
			}
			Review.remove({"_id": {$in: foundCampground.reviews}}, async function(err) {
				if (err) {
					req.flash("error", err.message);
					return res.redirect("back");
				}
				try {
					await cloudinary.v2.uploader.destroy(foundCampground.imageId);
					foundCampground.remove();
					req.flash("success", "Campground Removed Successfully");
					res.redirect("/campgrounds");
				} catch (err) {
					req.flash("error", err.message);
					return res.redirect("back");
				}	
			});
		});
	});
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router;