const mongoose = require('mongoose')

const conversationSchema = new mongoose.Schema({
    recipients: [{ type: mongoose.Types.ObjectId, ref: 'user' }],
    text: String,
    media: Array,
    call: Object,
    voice:{
        type: String,
        default:''
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('conversation', conversationSchema)