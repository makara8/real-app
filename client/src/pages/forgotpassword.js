import React, { useEffect, useState } from 'react'
import { useDispatch,useSelector } from 'react-redux'
import { forgotPass, refreshtoken, verifyemail } from '../redux/actions/authAction'
import { postDataAPI } from '../utils/fetchData'
import { GLOBALTYPES } from '../redux/actions/globalTypes'


const Forgotpassword = () => {

  const dispatch = useDispatch()
  const [userId,setUserId] = useState()

  
   const {auth} = useSelector(state => state)
    
   const initialState = {
    email:""
   }

 
  
   const [userData,setUserData] = useState(initialState)
  
   const {email} = userData
  
   const handleChangeInput = e => {
    const {name,value} = e.target
    setUserData({...userData,[name]:value})
   }

   const handleSubmit = async (e) => {
    e.preventDefault();
   dispatch(forgotPass(userData))

  }
    

  return (
    <div className="auth_page">
    <form onSubmit={handleSubmit}>
        <h3 className="text-uppercase text-center mb-4">Mak-Network</h3>

        <div className="form-group">
            <label htmlFor="exampleInputEmail1">Forgot Password</label>
            <input type="text" className="form-control" id="exampleInputEmail1" name="email"
            aria-describedby="emailHelp" placeholder='Enter Your Email' value={email} onChange={handleChangeInput}/>
            
        </div>

       
        
        <button type="submit" className="btn btn-dark w-100"
       >
           Submit
        </button>

       
    </form>
</div>
  )
}

export default Forgotpassword
