const Users = require('../models/userModel')

const userCtrl = {
    searchUser : async (req,res) => {
       try {
        const users = await Users.find({username:{$regex:req.query.username}})
        .limit(10).select("fullname username avatar")

        return res.status(200).json({users})
       } catch (error) {
        return res.status(500).json({msg: err.message})
       }

    },
    getUser: async (req, res) => {
       try {
        const user = await Users.findById(req.params.id)
        .select('-password')
            .populate("followers following", "-password")
        if (!user) return res.status(400).json({msg: "User Not Found"})
        return res.status(200).json({user})
       } catch (error) {
        return res.status(500).json({msg: err.message})
       }
    },
    updateUser: async (req, res) => {
      try {
        const { avatar, fullname, mobile, address, story, website, gender } = req.body
        if (!fullname)  return res.status(400).json({msg: "Please add Your Full Name"})

        await Users.findByIdAndUpdate({_id:req.user._id},{
            avatar, fullname, mobile, address, story, website, gender
        })
        return res.status(200).json({msg:'You Updated Success!'})
      } catch (error) {
        return res.status(500).json({msg:error.message})
      }
    },
    follow: async (req, res) => {
      try {
        const user = await Users.find({_id:req.params.id,followers:req.user._id})

        if (user.length > 0)  return res.status(400).json({msg: "You Follow this user"})
 
        const newUser = await Users.findByIdAndUpdate({_id:req.params.id},{
            $push:{followers:req.user._id}
        },{new:true}).populate("followers following", "-password")
 
     await Users.findByIdAndUpdate({_id:req.user._id},{
        $push:{following:req.params.id}
     },{new:true})
 
     return res.status(200).json({newUser})
      } catch (error) {
        return res.status(500).json({msg: err.message})
      }

    },
    unfollow: async (req, res) => {
        try {
          
     
            const newUser = await Users.findByIdAndUpdate({_id:req.params.id},{
                $pull:{followers:req.user._id}
            },{new:true}).populate("followers following", "-password")
     
         await Users.findByIdAndUpdate({_id:req.user._id},{
            $pull:{following:req.params.id}
         },{new:true})
     
         return res.status(200).json({newUser})
          } catch (error) {
            return res.status(500).json({msg: err.message})
          }
    
    },
    suggestionsUser: async (req, res) => {
      try {
        const newArr = [...req.user.following, req.user._id]

        const num  = req.query.num || 10

        const users = await Users.aggregate([
            { $match: { _id: { $nin: newArr } } },
            { $sample: { size: Number(num) } },
            { $lookup: { from: 'users', localField: 'followers', foreignField: '_id', as: 'followers' } },
            { $lookup: { from: 'users', localField: 'following', foreignField: '_id', as: 'following' } },
        ]).project("-password")

        return res.json({
            users,
            result: users.length
        })

    } catch (err) {
        return res.status(500).json({msg: err.message})
    }
    },
}


module.exports = userCtrl