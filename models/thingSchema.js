const mongoose = require('mongoose');
const paginate = require('mongoose-paginate-v2');
mongoose.Promise = global.Promise;
const VisibilityTypes = require('../types/visibilityTypes.js'); 

const thingSchema = new mongoose.Schema({
    _id: { type: String, required: "Please, supply an _id" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    visibility: {type: String, enum: VisibilityTypes, default: VisibilityTypes.private },
    tags: { type: [String], ref: 'Tag' },
    metadata: { type: Map, of: String },
    relations: { type: [String], ref: 'Thing' },
    timestamp: {type: Date, default: Date.now, select: false },
    lastmod: {type: Date, default: Date.now, select: false }
});

thingSchema.set('toJSON', { versionKey: false });
thingSchema.index({ owner: 1 });
thingSchema.plugin(paginate);
thingSchema.plugin(require('mongoose-autopopulate'));

// validate tags
thingSchema.path('tags').validate({
    validator: async function (values) {
        const Tag = this.constructor.model('Tag');
        if(!values) return true;
        for (let i = 0; i < values.length; i++) {
            let tag = await Tag.findById(values[i]);
            if (!tag) return false;
        };
        return true;
    },
    message: 'Tag not existent'
});

// validate owner
thingSchema.path('owner').validate({
    validator: async function (value) {
        const User = this.constructor.model('User');
        let user = await User.findById(value);
        if (!user) return false;
        return true;
    },
    message: 'User not existent'
});

// validate relations
thingSchema.path('relations').validate({
    validator: async function (values) {
        if(!values) return true;
        for (let i = 0; i < values.length; i++) {
            const relations = await this.constructor.findById(values[i]);
            if (!relations) return false;
        };
        return true;
    },
    message: 'Relation not existent'
});

module.exports = thingSchema;