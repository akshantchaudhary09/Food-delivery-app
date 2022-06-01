const { json } = require("express")
const Review = require('../../../models/review')
require('@tensorflow/tfjs');
const toxicity = require('@tensorflow-models/toxicity');

function reviewController() {
    return {
        async index(req, res) {
            Review.find({}, null, { sort: { 'createdAt': -1 }}).populate('customerId', '-password').exec((err, reviews) => {
                if(err) console.log(err);
                return res.render('customers/review', { reviews })
            });
        },
        postReview(req, res) {
            const { content } = req.body;
            if(!content) {
                return res.status(422).json({ message : 'All fields are required' });
            }
            
            // ml model 
            const threshold = 0.9;
            toxicity.load(threshold).then(model => {
                const sentences = [];
                sentences.push(content);
                model.classify(sentences).then(predictions => {
                    let isNegative = false;
                    predictions.forEach((prediction) => {
                        prediction.results.forEach((result) => {
                            if(result.match === true) isNegative = true; 
                        })
                    })

                    const review = new Review({
                        customerId: req.user._id,
                        content,
                        isNegative
                    })
                    review.save().then((review) => {
                        return res.redirect("/reviews");
                    }).catch(err => {
                        req.flash('error', 'something went wrong');
                        return res.redirect("/reviews");
                    })

                });
            });

        },
        delReview(req, res) {
            const { reviewId } = req.body;
            Review.deleteOne({"_id": reviewId}, function (err) {
            if(err) console.log(err);
                console.log(`Removing review with ID ---> ${reviewId}`)
                res.status(200).json({ message : 'Successfully deleted review' });
            });
        }
    }
}

module.exports = reviewController