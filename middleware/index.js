var Campground = require("../models/campgrounds");
var Comment = require("../models/comments");
var Review = require("../models/reviews");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
	if (req.isAuthenticated()) {
		Campground.findById(req.params.id, function(err, foundCampground) {
			if (err || !foundCampground) {
				console.log(err);
				req.flash("error", "Campground not Found");
				res.redirect("back");
			} else {
				if (foundCampground.author.id.equals(req.user._id)) {
					next();
				} else {
					console.log("You donot have access to the campground specified")
					req.flash("error", "You donot have the permission to do that");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
	}
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
	if (req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, function(err, foundComment) {
			if(err || !foundComment) {
				req.flash("error", "Comment not Found");
				res.redirect("back");
			} else {
				if (foundComment.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash("error", "You donot have the permission to do that");
					res.redirect("back");
				}	
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
	}
}

middlewareObj.checkReviewOwnership = function(req, res, next) {
	if (req.isAuthenticated()) {
		Review.findById(req.params.review_id, function(err, foundReview) {
			if (err || !foundReview) {
				req.flash("error", "Review Not Found");
				res.redirect("back");
			} else {
				if (foundReview.author.id.equals(req.user._id)) {
					next();
				} else {
					req.flash("error", "You do not have the permission to do that")
					res.redirect("back");
				}
			}
		});		
	} else {
		req.flash("error", "You need to be logged in to do that")
		res.redirect("back");
	}
}

middlewareObj.checkReviewExistence = function(req ,res, next) {
	if (req.isAuthenticated()) {
		Campground.findById(req.params.id).populate("reviews").exec(function(err, foundCampground) {
			if (err || !foundCampground) {
				req.flash("error", "Campground Not Found");
				res.redirect("back");
			} else {
				var foundUserReview = foundCampground.reviews.some(function (review) {
					return review.author.id.equals(req.user._id);
				});
				if (foundUserReview) {
					req.flash("error", "You have already reviewed the campground");
					res.redirect("back");
				} else {
					next();
				}
			}
		});
	} else {
		req.flash("error", "You need to be logged in to do that");
		res.redirect("back");
	}
}

middlewareObj.isLoggedIN = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "You need to be logged in to do that")
	res.redirect("/login");
}

module.exports = middlewareObj;