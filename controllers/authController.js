const Users = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const VerificationToken = require('../models/VerificationToken')
const {generateOTP} = require('../Extra/Mail')
const nodemailer = require('nodemailer');
const ResetToken = require('../models/ResetToken')
const crypto = require('crypto')


const authCtrl = {  
 register: async (req,res) => {
   try {
    const { fullname, username, email, password, gender } = req.body
    let newUserName = username.toLowerCase().replace(/ /g, '')

    let user = await Users.findOne({ email: req.body.email })
      if (user) {
        return res.status(200).json("please login with correct password");
      }

    const user_name = await Users.findOne({username:newUserName})
    if (user_name) return res.status(400).json({msg:'This Username Alredy exists'})

    const user_email = await Users.findOne({email:email})
    if (user_email) return res.status(400).json({msg:'This email Alredy exists'})

    if (password.length < 6) {
        return res.status(400).json({msg:'Passoword must be at bigger than 6 character'})
    }
    const hashPassowrd = await bcrypt.hash(password,12)

   user =  new Users({
     fullname,username:newUserName,email,password:hashPassowrd,gender   
    })

    

   const OTP = generateOTP()
   const verificationToken = await VerificationToken.create({
     user:user._id,
     token:OTP
   })

   verificationToken.save()

   await user.save();

   const access_token = createAccessToken({id:user._id})
   const refresh_token = createRefreshToken({id: user._id})

   res.cookie('refreshtoken', refresh_token, {
       httpOnly: true,
       path: '/api/refresh_token',
       maxAge: 30*24*60*60*1000 // 30days
   })


   const transporter = nodemailer.createTransport({
     service: "gmail",
     auth: {
         user: process.env.EMAIL,
         pass: process.env.PASSWORD
     }
 });
 const mailOptions = {
   from: process.env.EMAIL,
   to: user.email,
   subject: "Verify Your Email Using OTP",
   html: `<h1>Your OTP CODE ${OTP}</h1>`
};

transporter.sendMail(mailOptions, (error, info) => {
 if (error) {
     console.log("Error" + error)
 } else {
     console.log("Email sent:" + info.response);
     res.status(201).json({status:201,info})
 }
})

   res.status(200).json({Status:'Pending' ,msg:'we have been send otp to your email check your email',user:{...user._doc,password:""} ,access_token,id:user._id});
   } catch (error) {
    return res.status(500).json({msg: error.message})
   }
 },
 verifyEmail:async (req,res) => {
  
    const {user , OTP} = req.body;
    const mainuser = await Users.findById(user);
    if(!mainuser) return res.status(400).json({msg:"User not found"});
    if(mainuser.verified === true){
        return res.status(400).json({msg:"User already verifed"})
    };
    const token = await VerificationToken.findOne({user:mainuser._id});
    if(!token){
        return res.status(400).json({msg:"Sorry token not found"})
    }
    const isMatch =  bcrypt.compareSync(OTP , token.token);
    if(!isMatch){return res.status(400).json({msg:"OTP is not valid"})};

    mainuser.verified = true;
    await VerificationToken.findByIdAndDelete(token._id);
    await mainuser.save();
    const access_token = createAccessToken({id:mainuser._id})
    const refresh_token = createRefreshToken({id:mainuser._id})
   res.cookie('refreshtoken',refresh_token,{
    httpOnly: true,
    path: '/api/refresh_token',
    maxAge: 30*24*60*60*1000 // 30days
   })
    const {password , ...other} = mainuser._doc;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD
      }
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: mainuser.email,
    subject: "You verify success",
    html: '<h1>Congratulation</h1> <h1> You successfully verify email </h2>'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
      console.log("Error" + error)
  } else {
      console.log("Email sent:" + info.response);
      res.status(201).json({status:201,info})
  }
})


      return res.status(200).json({msg:'You Veirfy SuccessFully',other , access_token})
 
 },
 login: async (req,res) => {
 
    try {
      const {email,password} = req.body
  const user = await Users.findOne({email:email}) .populate("followers following", "avatar username fullname followers following")
  if (!user) return res.status(400).json({msg:'Email Not Exist'})
  const comparepass = await bcrypt.compare(password,user.password)
  if (!comparepass) return res.status(400).json({msg:'passowrd Not Match'})
  if (user.verified === false) return res.status(400).json({msg:'you not been verify email yet'})
  const access_token = createAccessToken({id:user._id})
  const refresh_token = createRefreshToken({id:user._id})
 res.cookie('refreshtoken',refresh_token,{
  httpOnly: true,
  path: '/api/refresh_token',
  maxAge: 30*24*60*60*1000 // 30days
 })
 res.json({
  msg: 'Login Success!',
  access_token,
  user: {
      ...user._doc,
      password: ''
  }
})
    } catch (error) {
      return res.status(500).json({msg: error.message})
    }
  
 },
 logout: async (req,res) => {
  try {
    res.clearCookie('refreshtoken',{path: '/api/refresh_token'})
    return res.status(200).json({msg: "Logout Success!"})
  } catch (error) {
    return res.status(500).json({msg: error.message})
  }
 },
 generateAccessToken:async(req,res) => {
  try {
    const rf_token = req.cookies.refreshtoken
    if (!rf_token) return res.status(400).json({msg: "Please Login Guy"})
    jwt.verify(rf_token,process.env.REFRESH_TOKEN_SECRET,async (err,result) => {
      if (err)  return res.status(400).json({msg: "Please Login Guy"})
      const user = await Users.findById(result.id).select("-password").populate("followers following", "avatar username fullname followers following")
      if (!user) return res.status(400).json({msg: "User Not Found"})
    
      const access_token = createAccessToken({id:result.id})

      return res.status(200).json({access_token,user,id:user._id})

    })
    
  } catch (error) {
    return res.status(500).json({msg: error.message})
  }
 },

 forgotPassword:async (req,res) => {
 try {
  const {email} = req.body
  const user = await Users.findOne({email:email})
  if (!user) return res.status(400).json({msg: 'User Not Found'})

 const token = await ResetToken.findOne({user:user._id})
 if (token) return res.status(400).json({msg: 'After One Hour You Can Access Again'})

 const randomText =  crypto.randomBytes(20).toString('hex')
 const newResToken =  new ResetToken({
  user:user._id,
  token:randomText
 })

 await newResToken.save()

 const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD
  }
});


const mailOptions = {
from: process.env.EMAIL,
to: user.email,
subject: "Reset Token",
html: `<h1>please click this link</h1>http://localhost:3000/reset/password?token=${randomText}&_id=${user._id}`
};
transporter.sendMail(mailOptions, (error, info) => {
if (error) {
    console.log("Error" + error)
} else {
    console.log("Email sent:" + info.response);
    res.status(201).json({status:201,info})
}
})

return res.status(200).json({msg:"Check Your Email To Reset Password"})

 } catch (error) {
  
 }
 },

 resetPass:async (req,res) => {
  const {token,_id} = req.query
  if (!token || !_id) return res.status(400).json({msg:"Invalid request"})
  const user = await Users.findById({_id:_id})
  if (!user) return res.status(400).json({msg:"User Not Found"})
  const resetToken = await ResetToken.findOne({user:user._id})
  if (!resetToken) return res.status(400).json({msg:"Token Not Found"})

  const isMatch =  bcrypt.compareSync(token,resetToken.token)
  if (!isMatch)  return res.status(400).json({msg:"Token is Not Valid"})

  const {password} = req.body
  const secpass = await bcrypt.hash(password,10)
  user.password = secpass
  await user.save()

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }
  });
  
  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: "Your password reset successfull",
    html: '<h1>Now You can login with new password</h1>'
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.log("Error" + error)
    } else {
        console.log("Email sent:" + info.response);
        res.status(201).json({status:201,info})
    }
  })
  
  return res.status(200).json({msg:"Now You can login with new password"})

 }

}

const createAccessToken =  (payload) => {
    return jwt.sign(payload,process.env.ACCESS_TOKEN_SECRET,{expiresIn:"1d"})
}

const createRefreshToken  =  (payload) => {
    return jwt.sign(payload,process.env.REFRESH_TOKEN_SECRET,{expiresIn:"30d"})
}



module.exports = authCtrl