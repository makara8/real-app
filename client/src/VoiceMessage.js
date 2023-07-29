import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useSelector,useDispatch } from 'react-redux';

import { GLOBALTYPES } from './redux/actions/globalTypes';
import { useParams } from 'react-router-dom';
import { addVoiceMessage } from './redux/actions/messageAction';


const VoiceMessage = ({refDisplay,pageEnd,setIsLoadMore}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [audioUrl, setAudioUrl] = useState(null);
  const dispatch = useDispatch()

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
  const { call, auth, peer, socket, theme } = useSelector(state => state)
  const {id} = useParams()
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const constraints = { audio: true };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          const mediaRecorder = new MediaRecorder(stream);
          setMediaRecorder(mediaRecorder);

          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              setAudioChunks((prevChunks) => [...prevChunks, event.data]);
            }
          };
        })
        .catch((error) => {
          console.error('Error accessing microphone:', error);
        });
    }
  }, []);

  const startRecording = () => {
    setIsRecording(true);
    setAudioChunks([]);
    mediaRecorder.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorder.stop();
  };

  const handleSendVoiceMessage = async () => {
    dispatch({ type: GLOBALTYPES.ALERT, payload: { loading: true } });
    try {
      if (!audioChunks.length) {
        console.warn('No recorded audio to send.');
        return;
      }
  
      // Convert audioChunks into a Blob
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const sender = auth.user._id
      const recipient = id

      console.log(sender)
      console.log(recipient)
      // Convert audioBlob to base64 string
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = () => {
        const base64String = reader.result.split(',')[1];
       
        // Send the base64String to the backend using fetch
        sendAudioData(base64String,sender,recipient);
      };
    } catch (error) {
      console.error('Error sending audio:', error);
    }
  };
  
  const sendAudioData = async (base64String,sender,recipient) => {
    try {
     const msg = {
      voice: base64String,
      sender,
      recipient
     }
      dispatch(addVoiceMessage({msg,auth,socket}))

      if(refDisplay.current){
        refDisplay.current.scrollIntoView({behavior: 'smooth', block: 'end'})
    }
      setAudioChunks([]);
    } catch (error) {
      console.error('Error sending audio:', error);
    }
  };
  



  return (
    <div className="call_modal" >
           
            <div className="call_box" style={{position:'relative',filter : theme ? 'invert(1)' : 'invert(0)'}}  >
            <i className="fa-solid fa-x markx" onClick={() => dispatch({type:GLOBALTYPES.VOICE,payload:false})}></i>
            <div className="text-center" style={{ padding: '40px 40px', backgroundColor: isRecording ? 'red' : 'white', borderRadius: "50%", cursor: "pointer" }}>
  <i className="fa-solid fa-microphone" style={{ fontSize: '50px', color: isRecording ? "white" : "black" }} ></i>


</div>
              { isRecording && <div style={{marginTop:'20px'}}>
                <p style={{display:'inline-block',cursor:'pointer'}} onClick={stopRecording}>Stop</p>
                 
                 </div>}
                 {isRecording === false && audioChunks.length === 0 &&  <div style={{marginTop:'20px'}}>
                 <p style={{display:'inline-block',cursor:'pointer'}} onClick={startRecording}>Start</p>
                 </div>}
                {audioChunks.length > 0 && 
               <div style={{marginTop:'20px'}}>
                 <p style={{display:'inline-block',cursor:'pointer'}} onClick={handleSendVoiceMessage}>Send</p>
                 </div>}

                <div className="call_menu">
                  
                  
                    
                </div>
                
            </div>

            <div className="show_video" style={{
               
                filter: theme ? 'invert(1)' : 'invert(0)'
            }} >

              
                <div className="time_video">
                  
                </div>

               

            </div>

        </div>
  );
};

export default VoiceMessage;