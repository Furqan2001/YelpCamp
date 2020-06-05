var mongoose = require("mongoose");
var Campground = require("./models/campgrounds");
var Comment = require("./models/comments");
var Review = require("./models/reviews");

var data = [
	{
		name: "Pir Chinasi",
		image: "https://www.worldfortravel.com/wp-content/uploads/2017/05/pir-chinasi-1.jpg",
		description: "Pir Chinasi is bordered with pine forests and oak trees that give pleasant summer s and snowy winters to its tourism. The area is good for camping. While camping, you can enjoy bonfires, seasonal fruit partie s and witness the magical sunset and sunrise."
	},
	{
		name: "Shogran",
		image: "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcR0EERFgg5XU5sMdyR5-4eRIP1NNAnpWUvNkCUL9PnbxzGW_RE0&usqp=CAU",
		description: "Shogran is a hill station situated on a green plateau in the Kaghan Valley, n orthern Pakistan at a height of 7,749 feet or 2,362 meters above sea level. Shogran is a picturesque hill station with a surro unding view of Makra Peak and Musa Ka Mussala. In winters it receives an average snowfall of 3-4 feet."
	},
	{
		name: "Fairy Meadows",
		image: "https://atls.pk/wp-content/uploads/2018/03/rupal_face.jpg",
		description: "Fairy Meadow is a lush green plateau, at 3300 m, offering a breath taki ng view of Majestic Nanga Parbat (The Killer Mountain). Many people have called it the \"Heaven on Earth\". These lush, green meadows and forests lie at the base of Nanga Parbat at the western edge of the Himaliyan range in Pakistan."		
	}
]

function seedDB() {
	Campground.deleteMany({}, function(err) {
		if (err) {
			console.log(err);
		}
		console.log("Campgrounds Removed");
		Comment.deleteMany({}, function(err) {
			if (err) {
				console.log(err);
			}
			console.log("Comments Removed");
			Review.deleteMany({}, function(err) {
				if (err) {
					console.log(err);
				}
				console.log("Reviews Removed");
			// data.forEach(function(newCampground) {
			// 	Campground.create(newCampground, function(err, campground) {
			// 		if (err) {
			// 			console.log(err);
			// 		} else {
			// 			console.log("Added a Campground");
			// 			Comment.create({
			// 				text: "This place is good but I wish there was internet.",
			// 				author: "Homer"
			// 			}, function(err, comment) {
			// 				if (err) {
			// 					console.log(err);
			// 				} else {
			// 					campground.comments.push(comment);
			// 					campground.save();
			// 					console.log("Comment Added");
			// 				}
			// 			})							
			// 		}
			// 	})
			// })
			})	
		})		
	})
}

module.exports = seedDB;
						  