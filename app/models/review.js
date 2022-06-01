const mongoose = require('mongoose')
const Schema = mongoose.Schema

const reviewSchema = new Schema({
    customerId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
                },
    content: { type: String, required: true },
    isNegative: {type: String, required: true}, 
}, { timestamps: true })

module.exports = mongoose.model('Review', reviewSchema)