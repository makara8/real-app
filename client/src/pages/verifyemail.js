import React, { useEffect, useState } from 'react'
import { useDispatch,useSelector } from 'react-redux'
import { refreshtoken, verifyemail } from '../redux/actions/authAction'
import { postDataAPI } from '../utils/fetchData'
import { GLOBALTYPES } from '../redux/actions/globalTypes'


const VerifyEmail = () => {
    const dispatch = useDispatch()
    const [userId,setUserId] = useState()
  
    
     const {auth} = useSelector(state => state)
      
  

    useEffect(() => {
        dispatch(refreshtoken())
        
      },[dispatch])
    
   


    const initialState = {
        OTP:""
       }

     
      
       const [userData,setUserData] = useState(initialState)
      
       const {OTP,user} = userData
      
       const handleChangeInput = e => {
        const {name,value} = e.target
        setUserData({...userData,[name]:value})
       }
    
      
    
   

  const handleSubmit = async (e) => {
    e.preventDefault();
   dispatch(verifyemail({OTP:OTP,user:auth.id}))

  }
  
  

 


  return (
    <div className="auth_page">
    <form onSubmit={handleSubmit}>
        <h3 className="text-uppercase text-center mb-4">Mak-Network</h3>

        <div className="form-group">
            <label htmlFor="exampleInputEmail1">Confirm OTP</label>
            <input type="number" className="form-control" id="exampleInputEmail1" name="OTP"
            aria-describedby="emailHelp" onChange={handleChangeInput} value={OTP}  placeholder='Enter Your OTP'/>
            
        </div>

       
        
        <button type="submit" className="btn btn-dark w-100"
        disabled={OTP ? false : true} > 
           Submit
        </button>

       
    </form>
</div>
  )
}

export default VerifyEmail
