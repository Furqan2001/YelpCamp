var express    = require("express");
var router     = express.Router({mergeParams: true});
var Campground = require("../models/campgrounds"); 
var Comment    = require("../models/comments"); 
var middleware = require("../middleware");

//=====================
// Comment Routes
//=====================

router.get("/new", middleware.isLoggedIN , function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		if (err || !foundCampground) {
			console.log(err);
			req.flash("error", "Campground not Found");
			res.redirect("back");
		} else {
			res.render("comments/new", {campground: foundCampground});
		}
	})
});

router.post("/", middleware.isLoggedIN , function(req, res) {
	Campground.findById(req.params.id, function(err, campground) {
		if (err) {
			console.log(err);
			req.flash("error", "Item not Found");
			res.redirect("/campgrounds")
		} else {
			Comment.create(req.body.comment, function(err, comment) {
				if (err) {
					console.log(err);
					req.flash("error", "Cannot Create Comment");
					res.redirect("back");
				} else {
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Succesfully posted your comment");
					res.redirect("/campgrounds/"+campground._id);
				}
			});
		}
	})
});

// Edit Route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		if (err || !foundCampground) {
			req.flash("error", "Campground Not Found");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id, function(err, foundComment) {
			if (err) {
				req.flash("error", "Item not Found");
				res.redirect("back");
			} else {
				res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});
			}
		});
	});
});

// Update Route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		if (err || !foundCampground) {
			req.flash("error", "Campground Not Found");
			return res.redirect("back");
		}
		Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment , function(err, updatedComment) {
			if (err) {
				req.flash("error", "Comment not Found");
				res.redirect("back");
			} else {
				req.flash("success", "Successfully Edited the Comment");
				res.redirect("/campgrounds/"+ req.params.id);
			}
		});
	});	
});

// Destroy Route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res) {
	Comment.findByIdAndRemove(req.params.comment_id, function(err) {
		if (err) {
			req.flash("error", "Item not Found");
			res.redirect("back");
		} else {
			req.flash("success", "Comment Deleted");
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

module.exports = router;