import { Route, BrowserRouter as Router,Routes } from 'react-router-dom';
import PageRender from './customroute/PageRender';
import Home from './pages/home'
import Login from './pages/login'
import Notify from './components/alert/Alert';
import { useSelector,useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { refreshtoken } from './redux/actions/authAction';
import VerifyEmail from './pages/verifyemail';
import Reserpassword from './pages/resetpassword';
import Header from './components/header/Header';
import Register from './pages/Register';
import Forgotpassword from './pages/forgotpassword';
import PrivateRouter from './customroute/PrivateRouter';
import StatusModal from './components/StatusModal';
import { getPost, getPosts } from './redux/actions/postAction';
import { getSuggestions } from './redux/actions/suggestionsAction';
import io from 'socket.io-client'
import { GLOBALTYPES } from './redux/actions/globalTypes';
import SocketClient from './SocketClient';
import { getNotifies } from './redux/actions/notifyAction';
import CallModal from './components/message/CallModal';
import Peer from 'peerjs';

import VoiceMessage from './VoiceMessage';

function App() {

  const { auth, status, modal, call,voice } = useSelector(state => state)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(refreshtoken())

    const socket = io()
    dispatch({type: GLOBALTYPES.SOCKET, payload: socket})
    return () => socket.close()
  },[dispatch])

  useEffect(() => {
    if(auth.token) {
      dispatch(getPosts(auth.token))
      dispatch(getSuggestions(auth.token))
      dispatch(getNotifies(auth.token))
    }
  }, [dispatch, auth.token])

  
  useEffect(() => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }
    else if (Notification.permission === "granted") {}
    else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {}
      });
    }
  },[])

 
  useEffect(() => {
    const newPeer = new Peer(undefined, {
      path: '/', secure: true
    })
    
    dispatch({ type: GLOBALTYPES.PEER, payload: newPeer })
  },[dispatch])


  return (
    <Router>
      <Notify />
      <input type="checkbox" id="theme" />
      <div className="App">
        <div className='main'>
        {auth.token && auth.user.verified === true &&  <Header />}
        {status && <StatusModal />}
        {auth.token && <SocketClient />} 
        {call && <CallModal />}
       
          <Routes>
        
          <Route exact path='/' element={auth?.token && auth?.user?.verified === true ? <Home /> : <Login />} />
          <Route exact path='/register' element={auth?.token && auth?.user?.verified === true ? <Home /> : <Register />} />
          <Route exact path='/:page' element={<PageRender />} />
          <Route exact path='/:page/:id' element={<PageRender />} />
          <Route exact path='/reset/password' element={auth.token && auth.user.verified === true ? <Home /> : <Reserpassword />} />
          <Route exact path='/verifyemail' element={auth?.token && auth?.user?.verified === true ? <Home /> : <VerifyEmail />} />
          <Route exact path='/forgotpassword' element={auth?.token && auth?.user?.verified === true ? <Home /> : <Forgotpassword />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;