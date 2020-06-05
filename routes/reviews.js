var express    = require("express");
var router     = express.Router({mergeParams: true});
var Campground = require("../models/campgrounds");
var Review     = require("../models/reviews");
var middleware = require("../middleware");

router.get("/", function(req, res) {
	Campground.findById(req.params.id).populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function(err, foundCampground){
		if (err || !foundCampground) {
			req.flash("error", "Campground Not Found");
			return res.redirect("back");
		}
		res.render("reviews/index", {campground: foundCampground});
	});
});

router.get("/new", middleware.isLoggedIN, middleware.checkReviewExistence, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		if (err || !foundCampground) {
			req.flash("error", "Campground Not Found");
			return res.redirect("back");
		}
		res.render("reviews/new", {campground: foundCampground});
	})
});

router.post("/", middleware.checkReviewExistence, function(req, res) {
	Campground.findById(req.params.id).populate("reviews").exec(function(err, foundCampground) {
		if (err || !foundCampground) {
			req.flash("error", "Campground Not Found");
			return res.redirect("back");
		}
		Review.create(req.body.review, function(err, review) {
			if (err) {
			req.flash("error", "Review cannot be created");
			return res.redirect("back");
			}
			review.author.username = req.user.username;
			review.author.id = req.user._id;
			review.campground = foundCampground;
			review.save();
			foundCampground.reviews.push(review);
			foundCampground.rating = calculateAverage(foundCampground.reviews);
			foundCampground.save();
			req.flash("success", "Successfully posted review");
			res.redirect("/campgrounds/" + req.params.id);
		});
	});
});

router.get("/:review_id/edit", middleware.checkReviewOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		if (err || !foundCampground) {
			req.flash("error", "Campground Not Found");
			return res.redirect("back");
		} 
		Review.findById(req.params.review_id, function(err, foundReview) {
			if (err || !foundReview) {
				req.flash("error", "Review Not Found");
				return res.redirect("back");
			}
			res.render("reviews/edit", {campground_id: req.params.id, review: foundReview});
		});
	});
});

router.put("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Campground.findById(req.params.id).populate("reviews").exec(function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate campground average
            campground.rating = calculateAverage(campground.reviews);
            //save changes
            campground.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/campgrounds/' + campground._id);
        });
    });
});

router.delete("/:review_id", middleware.checkReviewOwnership, function(req, res) {
	Review.findByIdAndRemove(req.params.review_id, function(err) {
		if (err) {
			req.flash("error", "Cannot delete Review");
			return res.redirect("back");
		}
		Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, foundCampground) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            foundCampground.rating = calculateAverage(foundCampground.reviews);
            foundCampground.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/campgrounds/' + foundCampground._id);
        });
	});
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

module.exports = router;

