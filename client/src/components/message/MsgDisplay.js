import React,{useRef, useState} from 'react'
import Avatar from '../Avatar'
import { imageShow, videoShow } from '../../utils/mediaShow'
import { useSelector, useDispatch } from 'react-redux'
import { MESS_TYPES, deleteMessages } from '../../redux/actions/messageAction'
import Times from './Times'
import H5AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import LoadIcon from '../../images/loading.gif'

const MsgDisplay = ({user, msg, theme, data,loadedit,id}) => {
    const { auth,socket,message } = useSelector(state => state)
    const dispatch = useDispatch()
    const audioRef = useRef(null)

    const handleDeleteMessages = () => {
        if(!data) return;
        
        if(window.confirm('Do you want to delete?')){
            dispatch(deleteMessages({msg, data, auth,socket,recipient:id}))
        }
    }
    const playerRef = useRef(null);
   
    const [currentSpeed, setCurrentSpeed] = useState(1.0);
    const handleSpeedChange = (speed) => {
        
        setCurrentSpeed(speed);
    
        if (playerRef.current) {
          playerRef.current.audio.current.playbackRate = speed;
        }
      };

     

     const updateMessage = () => {
        dispatch({type:MESS_TYPES.EDIT_MESSAGE,payload:msg})
        
     }

    return (
        <>
            <div className="chat_title">
                <Avatar src={user.avatar} size="small-avatar" />
                <span>{user.username}</span>
            </div>

            <div className="you_content">
                { 
                    user._id === auth.user._id && msg.voice === '' && 
                  
                    <div className="dropdown dropstart text-end ">
                    <i className="fa-solid fa-ellipsis-vertical trashicon" data-bs-toggle="dropdown" 
                    style={{ cursor: "pointer", }} 
                    />
                    <ul className="dropdown-menu">
                      <li  onClick={handleDeleteMessages} >
                        <a className={`dropdown-item`}  style={{ cursor: "pointer" }}>
                        <i className="fas fa-trash text-danger "
                        
                    />
                        </a>
                      </li>
                      <li  onClick={() => updateMessage()}>
                        <a className={`dropdown-item`}  style={{ cursor: "pointer" }}>
                       Edit
                        </a>
                      </li>
                    </ul>
                  </div>
                }

                <div>
                    {
                        msg.text && 
                        <div className="chat_text"
                        style={{filter: theme ? 'invert(1)' : 'invert(0)'}}>
                            {msg.text}
                        </div>
                    }
                    {
                        msg.voice  && 
                        <div>
                        <H5AudioPlayer
                          ref={playerRef}
                          src={msg.voice}
                          customAdditionalControls={[
                            <div className="dropdown dropstart text-end">
                              <i className="fa-solid fa-ellipsis-vertical" data-bs-toggle="dropdown" style={{ cursor: "pointer" }} />
                              <ul className="dropdown-menu">
                                <li>
                                  <a className={`dropdown-item ${currentSpeed === 1.0 ? 'active' : ''}`} key="play-speed-1" onClick={() => handleSpeedChange(1)}>1x</a>
                                </li>
                                <li>
                                  <a className={`dropdown-item ${currentSpeed === 1.5 ? 'active' : ''}`} key="play-speed-1.5" onClick={() => handleSpeedChange(1.5)}>1.5x</a>
                                </li>
                                <li>
                                  <a className={`dropdown-item ${currentSpeed === 2.0 ? 'active' : ''}`} key="play-speed-2" onClick={() => handleSpeedChange(2)}>2.0x</a>
                                </li>
                              </ul>
                            </div>
                          ]}
                        />
                      </div>
                    }
                    {
                        msg.media.map((item, index) => (
                            <div key={index}>
                                {
                                    item.url.match(/video/i)
                                    ? videoShow(item.url, theme)
                                    : imageShow(item.url, theme)
                                }
                            </div>
                        ))
                    }
                </div>
               
            
                {
                    msg.call &&
                    <button className="btn d-flex align-items-center py-3"
                    style={{background: '#eee', borderRadius: '10px'}}>

                        <span className="material-icons font-weight-bold mr-1"
                        style={{ 
                            fontSize: '2.5rem', color: msg.call.times === 0 ? 'crimson' : 'green',
                            filter: theme ? 'invert(1)' : 'invert(0)'
                        }}>
                            {
                                msg.call.times === 0
                                ? msg.call.video ? 'videocam_off' : 'phone_disabled'
                                : msg.call.video ? 'video_camera_front' : 'call'
                            }
                        </span>

                        <div className="text-left">
                            <h6>{msg.call.video ? 'Video Call' : 'Audio Call'}</h6>
                            <small>
                                {
                                    msg.call.times > 0 
                                    ? <Times total={msg.call.times} />
                                    : new Date(msg.createdAt).toLocaleTimeString()
                                }
                            </small>
                        </div>

                    </button>
                }
            
            </div>

            <div className="chat_time">
               {msg.date ? msg.date : msg?.edit === true ? 'Edited At '  +  new Date(msg.updatedAt).toLocaleString()  : new Date(msg.createdAt).toLocaleString()} 
            </div>
        </>
    )
}

export default MsgDisplay