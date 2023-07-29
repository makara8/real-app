const Comments = require('../models/commentModel')
const Posts = require('../models/postModel')


const commentCtrl = {
    createComment: async (req, res) => {
       try {
        const { postId, content, tag, reply, postUserId } = req.body
        const post = await Posts.findById({_id:postId})
        if (!post) return res.status(400).json({msg:'This POst Does Not Exist'})
        if (reply) {
            const cm = await Comments.findById({_id:reply})
            if (!cm) return res.status(400).json({msg:'This Comment Does Not Exist'})
        }
        const newComment = new Comments({
            user:req.user._id,postId,content,tag,reply,postUserId
        })

        await Posts.findByIdAndUpdate({_id:postId},{
            $push:{comments:newComment._id}
        })

        await newComment.save()

       return res.json({newComment})
       } catch (error) {
        return res.status(500).json({msg: err.message})
       }
    },
    updateComment: async (req, res) => {
        try {
            const { content } = req.body
            
            await Comments.findOneAndUpdate({
                _id: req.params.id, user: req.user._id
            }, {content})

            res.json({msg: 'Update Success!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    likeComment: async (req, res) => {
       try {
        const comment = await Comments.findById(req.params.id)
        if (!comment) return res.status(400).json({msg:"Comment Not Exist"})
        await Comments.findByIdAndUpdate(req.params.id,{
            $push:{likes:req.user._id}
        })
        res.json({msg: 'Like Success!'})
       } catch (error) {
        
       }
    },
    unLikeComment: async (req, res) => {
        try {
            const comment = await Comments.findById(req.params.id)
            if (!comment) return res.status(400).json({msg:"Comment Not Exist"})
            await Comments.findByIdAndUpdate(req.params.id,{
                $pull:{likes:req.user._id}
            })
            res.json({msg: 'Like Success!'})
           } catch (error) {
            
           }
    },
    deleteComment: async (req, res) => {
        try {
            const comment = await Comments.findOneAndDelete({
                _id: req.params.id,
                $or: [
                    {user: req.user._id},
                    {postUserId: req.user._id}
                ]
            })

            await Posts.findOneAndUpdate({_id: comment.postId}, {
                $pull: {comments: req.params.id}
            })

            res.json({msg: 'Deleted Comment!'})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    }
}


module.exports = commentCtrl