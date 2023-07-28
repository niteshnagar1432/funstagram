var mongoose = require('mongoose');


var PostSchema = mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    bjectType: {
        type: String,
        default: 'post'
    },
    url: String,
    description: String,
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
            comment: String
        }
    ],
    like: {
        type: Array,
        default: []
    },
    shere: {
        type: Array,
        default: []
    },
    saved: {
        type: Array,
        default: []
    },
    time: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('posts', PostSchema);