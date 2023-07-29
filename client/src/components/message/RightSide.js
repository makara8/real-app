import React, { useState, useEffect, useRef } from 'react'
import UserCard from '../UserCard'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import MsgDisplay from './MsgDisplay'
import Icons from '../Icons'
import { GLOBALTYPES } from '../../redux/actions/globalTypes'
import { imageShow, videoShow } from '../../utils/mediaShow'
import { imageUpload } from '../../utils/imageUpload'
import { addMessage, getMessages, loadMoreMessages, deleteConversation, MESS_TYPES, updateMessage } from '../../redux/actions/messageAction'
import LoadIcon from '../../images/loading.gif'
import VoiceMessage from '../../VoiceMessage'
import EditMessage from './EditMessage'

import { putDataAPI } from '../../utils/fetchData'



const RightSide = () => {
    const { auth, message, theme, socket, peer,voice } = useSelector(state => state)
    const dispatch = useDispatch()

    const { id } = useParams()
    const [user, setUser] = useState([])
    const [text, setText] = useState('')
    const [media, setMedia] = useState([])
    const [loadMedia, setLoadMedia] = useState(false)

    const refDisplay = useRef()
    const pageEnd = useRef()

    const [data, setData] = useState([])
    const [result, setResult] = useState(9)
    const [page, setPage] = useState(0)
    const [isLoadMore, setIsLoadMore] = useState(0)

    const history = useNavigate()

    useEffect(() => {
        const newData = message.data.find(item => item._id === id)
        if(newData){
            setData(newData.messages)
            setResult(newData.result)
            setPage(newData.page)
        }
    },[message.data, id])

   

    useEffect(() => {
        if(id && message.users.length > 0){
            setTimeout(() => {
                refDisplay?.current?.scrollIntoView({behavior: 'smooth', block: 'end'})
            },50)

            const newUser = message.users.find(user => user._id === id)
            if(newUser) setUser(newUser)
        }
    }, [message.users, id])

   

    const handleDeleteMedia = (index) => {
        const newArr = [...media]
        newArr.splice(index, 1)
        setMedia(newArr)
    }
    const [media1,setMedia1] = useState([])
    useEffect(() => {
       if (message.editmessage) {
        setMedia1(message.editmessage?.media)
        setText(message.editmessage.text)
       } else {
        setText('')
       }
    },[ message.editmessage])

    const handleDeleteMedia1 = (index) => {
        const newArr = [...media1]
        newArr.splice(index, 1)
        setMedia1(newArr)
    }

    

    useEffect(() => {
        const getMessagesData = async () => {
            if(message.data.every(item => item._id !== id)){
                await dispatch(getMessages({auth, id}))
                setTimeout(() => {
                    refDisplay?.current?.scrollIntoView({behavior: 'smooth', block: 'end'})
                },50)
            }
        }
        getMessagesData()
    },[id, dispatch, auth, message.data])


    // Load More
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if(entries[0].isIntersecting){
                setIsLoadMore(p => p + 1)
            }
        },{
            threshold: 0.1
        })

        observer.observe(pageEnd.current)
    },[setIsLoadMore])

    useEffect(() => {
        if(isLoadMore > 1){
            if(result >= page * 9){
                dispatch(loadMoreMessages({auth, id, page: page + 1}))
                setIsLoadMore(1)
            }
        }
        // eslint-disable-next-line
    },[isLoadMore])

    const handleDeleteConversation = () => {
        if(window.confirm('Do you want to delete?')){
            dispatch(deleteConversation({auth, id,socket,recipient:id}))
           history('/message')
        }
    }

    // Call
    const caller = ({video}) => {
        const { _id, avatar, username, fullname } = user

        const msg = {
            sender: auth.user._id,
            recipient: _id, 
            avatar, username, fullname, video
        }
        dispatch({ type: GLOBALTYPES.CALL, payload: msg })
    }

    const callUser = ({video}) => {
        const { _id, avatar, username, fullname } = auth.user

        const msg = {
            sender: _id,
            recipient: user._id, 
            avatar, username, fullname, video
        }

        if(peer.open) msg.peerId = peer._id

        socket.emit('callUser', msg)
    }

    const handleAudioCall = () => {
        caller({video: false})
        callUser({video: false})
    }
    
    const handleVideoCall = () => {
        caller({video: true})
        callUser({video: true})
    }
    const handleVoice = () => {
        dispatch({type:GLOBALTYPES.VOICE,payload:true})
    }
    const [mediatype,setMediatype] = useState([])
    const handleChangeMedia = (e) => {
        const files = [...e.target.files]
        let err = ""
        let newMedia = []

        files.forEach(file => {
            if(!file) return err = "File does not exist."

            if(file.size > 1024 * 1024 * 5){
                return err = "The image/video largest is 5mb."
            }

            return newMedia.push(file)
        })

        if(err) dispatch({ type: GLOBALTYPES.ALERT, payload: {error: err} })
        setMedia([...media, ...newMedia])
       
    }

    const [checkmedia,setCheckMedia] = useState(false)
    const [mediaData,setMediaData] = useState([])
    const handleChangeMedia1 = (e) => {
        setCheckMedia(true)
        const files = [...e.target.files]
        let err = ""
        let newMedia = []

        files.forEach(file => {
            if(!file) return err = "File does not exist."

            if(file.size > 1024 * 1024 * 5){
                return err = "The image/video largest is 5mb."
            }

            return newMedia.push(file)
        })

        if(err) dispatch({ type: GLOBALTYPES.ALERT, payload: {error: err} })
        setMedia1([ ...media1,...newMedia])
        setMediatype([...newMedia])
        setMediaData([...media1])
    }
    const [edittext,setEditText] = useState('')
    const [ids,setIds] = useState('')
    
    const [Id,setId] = useState('')
    useEffect(() => {
        setId(ids)
    },[ids])
    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (message.editmessage) {
           if (message.editmessage.media.length > 0 && message.editmessage.text !== '') {
            dispatch(updateMessage({auth,socket,data,message,media1,text,setMedia1,recipient:id}))
           }else {
            if (text.length === 0 && media1.length === 0) {
                dispatch({type:GLOBALTYPES.ALERT,payload:{error:"You Mean  Want To Delete Message ?"}})
                dispatch({type:MESS_TYPES.EDIT_MESSAGE,payload:null})
            }else {
                dispatch(updateMessage({auth,socket,data,message,media1,text,setMedia1,recipient:id}))
            }
           }
        }else {
            if(!text.trim() && media.length === 0) return;
       
            setText('')
            setMedia([])
            setLoadMedia(true)
            
            let newArr = [];
            if(media.length > 0) newArr = await imageUpload(media)
    
           
            const msg = {
               _id:'',
                sender: auth.user._id,
                recipient: id,
                text, 
                media: newArr,
                edit:false,
              voice:'',
                createdAt: new Date().toISOString()
            }
            dispatch(addMessage({ msg,auth, socket,setIds,setLoadMedia}))
            setLoadMedia(false)
        }
        if(refDisplay.current){
            refDisplay.current.scrollIntoView({behavior: 'smooth', block: 'end'})
        }
       
    }

    const [loadedit,setLoadEdit] = useState(false)
    const [mediaT,setMediaT] = useState('')
   

   
  
   
   
 

 
  

    return (
        <>
            <div className="message_header" style={{cursor: 'pointer'}} >
            {voice && <VoiceMessage refDisplay={refDisplay} pageEnd={pageEnd} setIsLoadMore={setIsLoadMore}/>}
                {
                    user.length !== 0 &&
                    <UserCard user={user}>
                        <div>
                            <i className="fas fa-phone-alt"
                            onClick={handleAudioCall} />

                            <i className="fas fa-video mx-3"
                            onClick={handleVideoCall} />

                            <i className="fas fa-trash text-danger"
                            onClick={handleDeleteConversation} />
                        </div>
                    </UserCard>
                }
            </div>
               
            <div className="chat_container" 
            style={{height: media.length > 0 ? 'calc(100% - 180px)' : ''}} >
                <div className="chat_display" ref={refDisplay}>
                    <button style={{marginTop: '-25px', opacity: 0}} ref={pageEnd}>
                        Load more
                    </button>

                   

                    {
                        data.map((msg, index) => (
                                <div key={index}>
                                    {
                                         msg.sender !== auth.user._id &&
                                        <div className="chat_row other_message">
                                            <MsgDisplay user={user} msg={msg} theme={theme} loadedit={loadedit} id={id}/>
                                        </div>
                                    }

                                    {
                                       
                                      msg.sender === auth.user._id &&
                                        <div className="chat_row you_message">
                                          
                                            <MsgDisplay user={auth.user} msg={msg} theme={theme} data={data} loadedit={loadedit} id={id}/>
                                        </div>
                                    }
                                </div>
                        ))
                    }
                    

                   {
                       loadMedia && 
                       <div className="chat_row you_message">
                           <img src={LoadIcon} alt="loading"/>
                       </div>
                   }

                </div>
            </div>

            <div className="show_media" style={{display: media.length > 0 ? 'grid' : 'none'}} >
                {
                    media.map((item, index) => (
                        <div key={index} id="file_media">
                            {
                                item.type.match(/video/i)
                                ? videoShow(URL.createObjectURL(item), theme)
                                : imageShow(URL.createObjectURL(item), theme)
                            }
                            <span onClick={() => handleDeleteMedia(index)} >&times;</span>
                        </div>
                    ))
                }
            </div>
          
             
           {
             <div className="show_media" style={{display:  media1.length > 0 ? 'grid' : 'none'}} >
               
           
            {
                message.editmessage &&   media1.map((item,index) => (
                    <div key={index} id="file_media" style={{
                        marginLeft:'80px'
                    }}>
                      
                        {
                           
                          item.type ?  item.type?.match(/video/i)
                          ? videoShow(URL.createObjectURL(item), theme)
                          : imageShow(URL.createObjectURL(item), theme) : item.url?.match(/video/i)
                            ? videoShow(item.url, theme)
                            : imageShow(item.url, theme)
                        }
                        <span onClick={() => handleDeleteMedia1(index)} >&times;</span>
                     
                    </div>
                ))
            }
        </div>
           }
                
              

            <form className="chat_input" onSubmit={handleSubmit} >
                
                {
                    message.editmessage 
                    ? <EditMessage  setEditText={setEditText} item={ message.editmessage} theme={theme} setText={setText}
                    setCheckMedia={setCheckMedia} edittext={edittext} text={text}/> : 
                    <input type="text" placeholder='Enter Your Message'
                    value={text} onChange={e => setText(e.target.value)}
                    style={{
                        filter: theme ? 'invert(1)' : 'invert(0)',
                        background: theme ? '#040404' : '',
                        color: theme ? 'white' : ''
                    }} />
                   
                   
                }
               
            

            

                <Icons setContent={setText} content={text} theme={theme} />

               {
                message.editmessage ?    <div className="file_upload">
                <i className="fas fa-image text-danger" />
                <input type="file" name="file" id="file"
                multiple accept="image/*,video/*" onChange={handleChangeMedia1} />
            </div> :  <div className="file_upload">
                    <i className="fas fa-image text-danger" />
                    <input type="file" name="file" id="file"
                    multiple accept="image/*,video/*" onChange={handleChangeMedia} />
                </div>
               }

                <i className="fa-solid fa-microphone" style={{cursor:'pointer',zIndex:'150'}} onClick={handleVoice}></i>

               {
                
              <button type="submit" className="material-icons" 
               >
                    near_me
                </button> 
               }

                
                
            </form>
        </>
    )
}

export default RightSide