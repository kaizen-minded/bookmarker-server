const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const bookSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User'
    },
    title: String,
    author: String,
    bookId: Number,
    status: {
        type: String,
        // enum: ['current', 'wishlist', 'completed'],
        default: 'wishlist'
    },
    bookCover: String,
    rating: Number,
    numOfRatings: Number,
    active: {
        type: Boolean,
        default: false
    },
    notes: [{
        currentPage: Number,
        body: String,
        lastUpdate:{
            type: Date,
            default: Date.now
        }
    }]
})

bookSchema.methods.serialize = function () {
    return {
        bookId: this.bookId || '',
        title: this.title || '',
        author: this.author || '',
        bookCover: this.bookCover || '',
        status: this.status || '',
        active: this.active || '',
        notes: this.notes || ''
    };
};

const Book = mongoose.model('Book', bookSchema);

module.exports ={ Book }