import { GLOBALTYPES, DeleteData, EditData } from '../actions/globalTypes'
import { postDataAPI, getDataAPI, deleteDataAPI, putDataAPI } from '../../utils/fetchData'
import { useSelector } from 'react-redux'
import { imageUpload } from '../../utils/imageUpload'

export const MESS_TYPES = {
    ADD_USER: 'ADD_USER',
    ADD_MESSAGE: 'ADD_MESSAGE',
    GET_CONVERSATIONS: 'GET_CONVERSATIONS',
    GET_MESSAGES: 'GET_MESSAGES',
    UPDATE_MESSAGES: 'UPDATE_MESSAGES',
    DELETE_MESSAGES: 'DELETE_MESSAGES',
    DELETE_CONVERSATION: 'DELETE_CONVERSATION',
    CHECK_ONLINE_OFFLINE: 'CHECK_ONLINE_OFFLINE',
    ADD_VOICE:'ADD_VOICE',
    EDIT_MESSAGE:'EDIT_MESSAGE',
    UPDATE_MESSAGE:'UPDATE_MESSAGE',
    EDIT_MESSAGE_MEDIA:'EDIT_MESSAGE_MEDIA'
}



export const addMessage = ({ msg,auth, socket,setIds,setLoadMedia}) => async (dispatch) =>{
    setLoadMedia(true)
    const { _id, avatar, fullname, username } = auth.user
    
    
    try {
     const res = await postDataAPI('message', msg, auth.token)
     dispatch({type: MESS_TYPES.ADD_MESSAGE, payload: {...msg,_id:res.data._id}})
     socket.emit('addMessage', {...msg, user: { _id, avatar, fullname, username } })
     setLoadMedia(false)
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response.data.msg}})
    }
}

export const addVoiceMessage = ({msg, auth, socket}) => async (dispatch) =>{

   
    
    try {
      const res=   await postDataAPI('upload', msg, auth.token)
      const { _id, avatar, fullname, username } = auth.user
      socket.emit('addMessage', {...res.data.newMessage, user: { _id, avatar, fullname, username } })
      dispatch({type: MESS_TYPES.ADD_VOICE, payload: res.data.newMessage})
     
        dispatch({ type: GLOBALTYPES.VOICE, payload: false });
        dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: false } });
      
  
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response.data.msg}})
    }
}

export const getConversations = ({auth, page = 1}) => async (dispatch) => {
    try {
        const res = await getDataAPI(`conversations?limit=${page * 9}`, auth.token)
        
        let newArr = [];
        res.data.conversations.forEach(item => {
            item.recipients.forEach(cv => {
                if(cv._id !== auth.user._id){
                    newArr.push({...cv, text: item.text, media: item.media, call: item.call})
                }
            })
        })

        dispatch({
            type: MESS_TYPES.GET_CONVERSATIONS, 
            payload: {newArr, result: res.data.result}
        })

    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response.data.msg}})
    }
}

export const getMessages = ({auth, id, page = 1}) => async (dispatch) => {
    try {
        const res = await getDataAPI(`message/${id}?limit=${page * 9}`, auth.token)
        const newData = {...res.data, messages: res.data.messages.reverse()}

        dispatch({type: MESS_TYPES.GET_MESSAGES, payload: {...newData, _id: id, page}})
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response.data.msg}})
    }
}

export const loadMoreMessages = ({auth, id, page = 1}) => async (dispatch) => {
    try {
        const res = await getDataAPI(`message/${id}?limit=${page * 9}`, auth.token)
        const newData = {...res.data, messages: res.data.messages.reverse()}

        dispatch({type: MESS_TYPES.UPDATE_MESSAGES, payload: {...newData, _id: id, page}})
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response.data.msg}})
    }
}

export const deleteMessages = ({msg, data, auth,socket,recipient}) => async (dispatch) => {
    const newData = DeleteData(data, msg._id)
    dispatch({type: MESS_TYPES.DELETE_MESSAGES, payload: {newData, _id: msg.recipient}})
    try {
        await deleteDataAPI(`message/${msg._id}`, auth.token)
        socket.emit('deleteMessage',{
            newData, _id: msg.sender,recipient
        })
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response.data.msg}})
    }
}

export const deleteConversation = ({auth, id,socket,recipient}) => async (dispatch) => {
    const ids = {
        id
    }
    const idss = {
        id:auth.user._id,
        recipient
    }
    dispatch({type: MESS_TYPES.DELETE_CONVERSATION, payload: ids})
    try {
       
        await deleteDataAPI(`conversation/${id}`, auth.token)
        socket.emit('deleteConversation',
        idss
        )
        
    } catch (err) {
        dispatch({type: GLOBALTYPES.ALERT, payload: {error: err.response.data.msg}})
    }
}

export const updateMessage = ({auth,socket,data,message,media1,text,setMedia1,recipient}) => async (dispatch) => {
    let newArr= []
    const imgNewUrl = media1.filter(img => !img.url)
    const imgOldUrl =  media1.filter(img => img.url)
    if (message.editmessage.text === text && imgNewUrl.length === 0
        && imgOldUrl.length === message.editmessage.media.length) {
            dispatch({type:MESS_TYPES.EDIT_MESSAGE,payload:null})
            setMedia1([])
            return
            
    }
    if (imgNewUrl.length > 0)  {
        dispatch({type:GLOBALTYPES.ALERT,payload:{loading:true}})
        newArr = await imageUpload(imgNewUrl)
       
    }
    dispatch({type:GLOBALTYPES.ALERT,payload:{loading:false}})
    const msg = {
        _id:message.editmessage._id,
        text:text,
        media:[...imgOldUrl,...newArr],
        recipient:message.editmessage.recipient,
        sender:message.editmessage.sender,
        edit:true,
        date: 'Edited At '  + new Date().toLocaleString(),
        voice:''
    }
    const newData  = EditData(data,message.editmessage._id,msg) 
    dispatch({type: MESS_TYPES.UPDATE_MESSAGE, payload: {newData, _id: message.editmessage.recipient}})
    setMedia1([])
    dispatch({type:MESS_TYPES.EDIT_MESSAGE,payload:null})
    socket.emit('updateMessageText',{
        newData, _id: message.editmessage.sender,recipient
    })
    try {
    const res = await putDataAPI(`updateMessage/${message.editmessage._id}`,msg,auth.token)
    
    
    dispatch({type:GLOBALTYPES.ALERT,payload:{success:res.data.msg}})
    } catch (error) {
        
    }
 
}



