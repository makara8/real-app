import { postDataAPI, putDataAPI } from "../../utils/fetchData"
import { GLOBALTYPES } from "./globalTypes"
import valid from "../../utils/valid"
import { useNavigate } from "react-router-dom"




export const login = (data) => async (dispatch) => {
    try {
        dispatch({type:GLOBALTYPES.ALERT,payload:{loading:true}})
        const res =  await postDataAPI('login',data)
        dispatch({type:GLOBALTYPES.AUTH,payload:{token:res.data.access_token,user:res.data.user}})
        localStorage.setItem('firstLogin',true)
        dispatch({type:GLOBALTYPES.ALERT,payload:{success:res.data.msg}})
    } catch (err) {
        dispatch({type:GLOBALTYPES.ALERT,payload:{error:err.response.data.msg}})
    }
}

export const refreshtoken = () => async (dispatch) => {
 
    const firstLogin = localStorage.getItem('firstLogin')
  if (firstLogin) {
    dispatch({type:GLOBALTYPES.ALERT,payload:{loading:true}})
    try {
        const res = await postDataAPI('refresh_token')
        dispatch({type:GLOBALTYPES.AUTH,payload:{token:res.data.access_token,user:res.data.user,id:res.data.id}})
        dispatch({type:GLOBALTYPES.ALERT,payload:{}})
    } catch (err) {
        dispatch({type:GLOBALTYPES.ALERT,payload:{error:err.response.data.msg}}) 
    }
   
  }
 
}

export const register = (data,navigate) => async (dispatch) => {
    const check = valid(data)
    if (check.errLength > 0) return dispatch({type:GLOBALTYPES.ALERT,payload:check.errMsg})
 try {
  
   dispatch({type:GLOBALTYPES.ALERT,payload:{loading:true}})

   const res = await postDataAPI('register',data)
 if (res.status === 200) {
    navigate('/verifyemail')
    
 }
 dispatch({type:GLOBALTYPES.ALERT,payload:{success:res.data.msg}})
   dispatch({type:GLOBALTYPES.AUTH,payload:{token:res.data.access_token,user:res.data.user,id:res.data.id}})
   localStorage.setItem('firstLogin',true)
   
   
 } catch (err) {
    dispatch({type:GLOBALTYPES.ALERT,payload:{error:err.response.data.msg}}) 
 }
}

export const verifyemail = (data) => async (dispatch) => {
  try {
    dispatch({type:GLOBALTYPES.ALERT,payload:{loading:true}})
  const res = await postDataAPI('verify/email',data)
  dispatch({type:GLOBALTYPES.ALERT,payload:{success:res.data.msg}})
   dispatch({type:GLOBALTYPES.AUTH,payload:{token:res.data.access_token,user:res.data.other}})
   localStorage.setItem('firstLogin',true)
  } catch (err) {
    dispatch({type:GLOBALTYPES.ALERT,payload:{error:err.response.data.msg}}) 
  }
}

export const forgotPass = (data) => async (dispatch) => {
    try {
        dispatch({type:GLOBALTYPES.ALERT,payload:{loading:true}})
      const res = await postDataAPI('forgot/pass',data)
      dispatch({type:GLOBALTYPES.ALERT,payload:{success:res.data.msg}})
      } catch (err) {
        dispatch({type:GLOBALTYPES.ALERT,payload:{error:err.response.data.msg}}) 
      }
}

export const resetPass = (data,navigate,code) => async (dispatch) => {
    try {
        dispatch({type:GLOBALTYPES.ALERT,payload:{loading:true}})
      const res = await putDataAPI(`reset/password?${code}`,data)
      if (res.status === 200) {
        navigate('/')
      }
      dispatch({type:GLOBALTYPES.ALERT,payload:{success:res.data.msg}})
      } catch (err) {
        dispatch({type:GLOBALTYPES.ALERT,payload:{error:err.response.data.msg}}) 
      }
}

export const logout = () => async (dispatch) => {
    try {
        dispatch({type:GLOBALTYPES.ALERT,payload:{loading:true}})
        localStorage.removeItem('firstLogin')
        const res =  await postDataAPI('logout')
        dispatch({type:GLOBALTYPES.ALERT,payload:{success:res.data.msg}})
        window.location.href = '/'
    } catch (err) {
        dispatch({type:GLOBALTYPES.ALERT,payload:{error:err.response.data.msg}}) 
    }
}