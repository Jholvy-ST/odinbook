const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema(
	{
		content: {type: String, required: true},
		image: {type: String},
		author: {type: Schema.Types.ObjectId, ref: 'User', required: true},
		date: {type: Date, default: Date.now},
		likes: {type: Array},
	}
)

module.exports = mongoose.model('Post', PostSchema);