import React, { useEffect, useState } from 'react'
import { useDispatch,useSelector } from 'react-redux'
import { refreshtoken, resetPass, verifyemail } from '../redux/actions/authAction'
import { postDataAPI } from '../utils/fetchData'
import { GLOBALTYPES } from '../redux/actions/globalTypes'
import { useLocation, useNavigate } from 'react-router-dom'


const ResetPassword = () => {
    const dispatch = useDispatch()
    const [userId,setUserId] = useState()
    const location = useLocation();
    const code = location.search.split("?")[1];
    
     const {auth} = useSelector(state => state)
      const navigate = useNavigate()
  

  
   


    const initialState = {
        password:""
       }

     
      
       const [userData,setUserData] = useState(initialState)
      
       const {password} = userData
      
       const handleChangeInput = e => {
        const {name,value} = e.target
        setUserData({...userData,[name]:value})
       }
    
      
    
   

  const handleSubmit = async (e) => {
    e.preventDefault();
   dispatch(resetPass(userData,navigate,code))
  }
  
  

 


  return (
    <div className="auth_page">
    <form onSubmit={handleSubmit}>
        <h3 className="text-uppercase text-center mb-4">Mak-Network</h3>

        <div className="form-group">
            <label htmlFor="exampleInputEmail1">New Password</label>
            <input type="text" className="form-control" id="exampleInputEmail1" name="password"
            aria-describedby="emailHelp" onChange={handleChangeInput} value={password}  placeholder='Enter Your New Password'/>
            
        </div>

       
        
        <button type="submit" className="btn btn-dark w-100"
        disabled={password ? false : true} > 
           Submit
        </button>

       
    </form>
</div>
  )
}

export default ResetPassword
