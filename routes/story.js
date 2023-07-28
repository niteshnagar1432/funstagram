var mongoose = require('mongoose');


var StorySchema = mongoose.Schema({
    account: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    bjectType: {
        type: String,
        default: 'story'
    },
    url: String,
    like: {
        type: Array,
        default: []
    },
    time: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('story', StorySchema);