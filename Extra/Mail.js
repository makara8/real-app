exports.generateOTP = () => {
    let OTP = ''
    for (let i = 0;i <= 5; i++) {
       let ranVal = Math.round(Math.random()*9)
       OTP = OTP + ranVal
    }
    return OTP
   }