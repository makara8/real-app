import React, { useEffect, useState } from 'react'
import { MESS_TYPES } from '../../redux/actions/messageAction'
import { useDispatch } from 'react-redux'

const EditMessage = ({item,theme,setText,setEditText,setCheckMedia,edittext,text}) => {
  const dispatch = useDispatch()
  
 
  return (
    
       <>
       {  <span style={{right:'95%',position:"absolute",fontSize:'30px',color:'red',
            cursor:'pointer',zIndex:'200',top:'92%'}} 
            onClick={() =>  dispatch({type:MESS_TYPES.EDIT_MESSAGE,payload:null})}>&times;</span>}
      <input type="text" 
        value={text}
     onChange={e => setText(e.target.value)}
   
    style={{
        filter: theme ? 'invert(1)' : 'invert(0)',
        background: theme ? '#040404' : '',
        color: theme ? 'white' : '',
        marginLeft:'50px'
        
    }} />
       </>
    
  )
}

export default EditMessage