import React, { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { POST_TYPES } from './redux/actions/postAction'
import { GLOBALTYPES } from './redux/actions/globalTypes'
import { NOTIFY_TYPES } from './redux/actions/notifyAction'
import { MESS_TYPES } from './redux/actions/messageAction'
import { DISCOVER_TYPES } from './redux/actions/discoverAction'
import { useNavigate } from 'react-router-dom'

import audiobell from './audio/got-it-done-613.mp3'
import { PROFILE_TYPES } from './redux/actions/profileAction'


const spawnNotification = (body, icon, url, title) => {
    let options = {
        body, icon
    }
    let n = new Notification(title, options)

    n.onclick = e => {
        e.preventDefault()
        window.open(url, '_blank')
    }
}

const SocketClient = () => {
    const { auth, socket, notify, online, call,message } = useSelector(state => state)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const audioRef = useRef()

    // joinUser
    useEffect(() => {
        socket.emit('joinUser', auth.user)
    },[socket, auth.user])

    // Likes
    useEffect(() => {
        socket.on('likeToClient', newPost =>{
            dispatch({type: POST_TYPES.UPDATE_POST, payload: newPost})
        })

        return () => socket.off('likeToClient')
    },[socket, dispatch])

    useEffect(() => {
        socket.on('unLikeToClient', newPost =>{
            dispatch({type: POST_TYPES.UPDATE_POST, payload: newPost})
        })

        return () => socket.off('unLikeToClient')
    },[socket, dispatch])


    // Comments
    useEffect(() => {
        socket.on('createCommentToClient', newPost =>{
            dispatch({type: POST_TYPES.UPDATE_POST, payload: newPost})
        })

        return () => socket.off('createCommentToClient')
    },[socket, dispatch])

    useEffect(() => {
        socket.on('deleteCommentToClient', newPost =>{
            dispatch({type: POST_TYPES.UPDATE_POST, payload: newPost})
        })

        return () => socket.off('deleteCommentToClient')
    },[socket, dispatch])


    // Follow
    useEffect(() => {
        socket.on('followToClient', newUser =>{
            dispatch({type: GLOBALTYPES.AUTH, payload: {...auth, user: newUser}})
        })

        return () => socket.off('followToClient')
    },[socket, dispatch, auth])

    useEffect(() => {
        socket.on('unFollowToClient', newUser =>{
            dispatch({type: GLOBALTYPES.AUTH, payload: {...auth, user: newUser}})
        })

        return () => socket.off('unFollowToClient')
    },[socket, dispatch, auth])


    // Notification
    useEffect(() => {
        socket.on('createNotifyToClient', msg =>{
            dispatch({type: NOTIFY_TYPES.CREATE_NOTIFY, payload: msg})

            if(notify.sound) audioRef.current.play()
            spawnNotification(
                msg.user.username + ' ' + msg.text,
                msg.user.avatar,
                msg.url,
                'V-NETWORK'
            )
        })

        return () => socket.off('createNotifyToClient')
    },[socket, dispatch, notify.sound])

    useEffect(() => {
        socket.on('removeNotifyToClient', msg =>{
            dispatch({type: NOTIFY_TYPES.REMOVE_NOTIFY, payload: msg})
        })

        return () => socket.off('removeNotifyToClient')
    },[socket, dispatch])


    // Message
    useEffect(() => {
        socket.on('addMessageToClient', msg =>{
            dispatch({type: MESS_TYPES.ADD_MESSAGE, payload: msg})

            dispatch({
                type: MESS_TYPES.ADD_USER, 
                payload: {
                    ...msg.user, 
                    text: msg.text, 
                    media: msg.media
                }
            })
        })

        return () => socket.off('addMessageToClient')
    },[socket, dispatch])

    // Check User Online / Offline
    useEffect(() => {
        socket.emit('checkUserOnline', auth.user)
    },[socket, auth.user])

    useEffect(() => {
        socket.on('checkUserOnlineToMe', data =>{
            data.forEach(item => {
                if(!online.includes(item.id)){
                    dispatch({type: GLOBALTYPES.ONLINE, payload: item.id})
                }
            })
        })

        return () => socket.off('checkUserOnlineToMe')
    },[socket, dispatch, online])

    useEffect(() => {
        socket.on('checkUserOnlineToClient', id =>{
            if(!online.includes(id)){
                dispatch({type: GLOBALTYPES.ONLINE, payload: id})
            }
        })

        return () => socket.off('checkUserOnlineToClient')
    },[socket, dispatch, online])

    // Check User Offline
    useEffect(() => {
        socket.on('CheckUserOffline', id =>{
            dispatch({type: GLOBALTYPES.OFFLINE, payload: id})
        })

        return () => socket.off('CheckUserOffline')
    },[socket, dispatch])


    // Call User
    useEffect(() => {
        socket.on('callUserToClient', data =>{
            dispatch({type: GLOBALTYPES.CALL, payload: data})
        })

        return () => socket.off('callUserToClient')
    },[socket, dispatch])

    useEffect(() => {
        socket.on('userBusy', data =>{
            dispatch({type: GLOBALTYPES.ALERT, payload: {error: `${call.username} is busy!`}})
        })

        return () => socket.off('userBusy')
    },[socket, dispatch, call])

    useEffect(() => {
        socket.on('addcreatePostClient',data => {
            dispatch({ 
                type: POST_TYPES.CREATE_POST, 
                payload: {...data, user: data.user} 
            })
        })
        return () => socket.off('addcreatePostClient')
    },[socket,dispatch])

    useEffect(() => {
        socket.on('discoverPostClient',data => {
            dispatch({type: DISCOVER_TYPES.POST_DISCOVER, payload: {
                posts:data,
            }})
        })
        return () => socket.off('discoverPostClient')
    },[socket,dispatch])

    useEffect(() => {
        socket.on('updatePostClient',data => {
            dispatch({ type: POST_TYPES.UPDATE_POST, payload: data })
        })
        return () => socket.off('updatePostClient')
    },[socket,dispatch])

    useEffect(() => {
        socket.on('deletePostClient',data => {
            dispatch({ type: POST_TYPES.DELETE_POST, payload: data })
        })
        return () => socket.off('deletePostClient')
    },[socket,dispatch])

    useEffect(() => {
        socket.on('likeCommentClient',data => {
            dispatch({ type: POST_TYPES.UPDATE_POST, payload: data })
        })
        return () => socket.off('likeCommentClient')
    },[socket,dispatch])

    useEffect(() => {
        socket.on('unlikeCommentClient',data => {
            dispatch({ type: POST_TYPES.UPDATE_POST, payload: data })
        })
        return () => socket.off('unlikeCommentClient')
    },[socket,dispatch])

    useEffect(() => {
        socket.on('updateCommentClient',data => {
            dispatch({ type: POST_TYPES.UPDATE_POST, payload: data })
        })
        return () => socket.off('updateCommentClient')
    },[socket,dispatch])
   
    useEffect(() => {
        socket.on('deleteMessageClient',data => {
            dispatch({type: MESS_TYPES.DELETE_MESSAGES, payload: data})
        })
        return () => socket.off('deleteMessageClient')
    },[socket,dispatch])

    useEffect(() => {
        socket.on('deleteConversationClient',id => {
           
            dispatch({type: MESS_TYPES.DELETE_CONVERSATION, payload: id})
            navigate('/message')
        })
       
    },[socket,dispatch])
   
    useEffect(() => {
        socket.on('updateMessageTextClient',data => {
            dispatch({type: MESS_TYPES.UPDATE_MESSAGE, payload: data})
           
        })
        return () => socket.off('updateMessageTextClient')
    },[socket,dispatch])

   
    return (
        <>
            <audio controls ref={audioRef} style={{display: 'none'}} >
                <source src={audiobell} type="audio/mp3" />
            </audio>
        </>
    )
}

export default SocketClient