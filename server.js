require('dotenv').config()
const mongoose = require('mongoose')
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const SocketServer = require('./socketServer')
const { ExpressPeerServer } = require('peer')
const path = require('path')
const firebase = require('firebase/app');
const multer = require('multer');
const Audio = require('./models/voiceModal')
const Conversations = require('./models/conversationModel')
const Messages = require('./models/messageModel')
const upload = multer()
const {v4:uuidv4} = require('uuid')
 // Add this line to import ObjectId

const app = express()

app.use(express.json())
app.use(cors())
app.use(cookieParser())



const http = require('http').createServer(app)
const io = require('socket.io')(http)

io.on('connection', socket => {
    SocketServer(socket)
})

ExpressPeerServer(http, { path: '/' })


app.use('/api',require('./routes/authRouter'))
app.use('/api',require('./routes/userRouter'))
app.use('/api',require('./routes/postRouter'))
app.use('/api',require('./routes/commentRouter'))
app.use('/api',require('./routes/notifyRouter'))
app.use('/api',require('./routes/messageRouter'))

const firebaseConfig = {
  apiKey: "AIzaSyC0qQG6XuPia0Pl4D82BXW25Bm8Gd7xgO0",
  authDomain: "social-media-8fdfa.firebaseapp.com",
  projectId: "social-media-8fdfa",
  storageBucket: "social-media-8fdfa.appspot.com",
  messagingSenderId: "725951791914",
  appId: "1:725951791914:web:b08785c4fb08060435d453"
};

var admin = require("firebase-admin");

var serviceAccount = require("./config/jj.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket:'social-media-8fdfa.appspot.com'
});

firebase.initializeApp(firebaseConfig);
const storage = admin.storage()
const bucket = admin.storage().bucket()

const multerStorage = multer.memoryStorage();
const multerUpload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit the file size to 10 MB (adjust as needed)
  },
});



// ... (rest of your code)  res.status(200).json({ audioUrl: audioUrl[0] });  



// ... (rest of your code)

app.post('/api/upload', async (req, res) => {
  try {
    console.log('Received audio data from the client.');

    const audioBlob = req.body.voice;

    // Convert the base64 string to a Buffer
    const buffer = Buffer.from(audioBlob, 'base64');

    // Set the filename and path in Firebase Storage
    const fileName = uuidv4() + '.webm'; // Use a fixed extension since it's audio
    const file = bucket.file(fileName);

    // Upload the audio data to Firebase Storage
    await file.save(buffer, {
      metadata: {
        contentType: 'audio/webm',
      },
    });

    // ... (rest of your code)
    console.log('Audio data uploaded to Firebase Storage.');

    // Get the public download URL for the uploaded audio
    const audioUrl = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491', // Set the expiration date to a distant future date
    });

    console.log('Audio URL:', audioUrl);

    // Save the audio URL and recipients in the database
    const { sender, recipient } = req.body;

    // Convert the string IDs to ObjectId
    const senderId = new mongoose.Types.ObjectId(sender);
    const recipientId = new mongoose.Types.ObjectId(recipient);
    const newConversation = await Conversations.findOneAndUpdate(
      {
        $or: [
          { recipients: [senderId, recipientId] },
          { recipients: [recipientId, senderId] },
        ],
      },
      {
        recipients: [senderId, recipientId],
        voice: audioUrl[0],
      },
      { new: true, upsert: true }
    );

    const newMessage = new Messages({
      conversation: newConversation._id,
      sender: senderId,
      recipient: recipientId,
      voice: audioUrl[0],
    });

    await newMessage.save();

    res.status(200).json({ newMessage });
  } catch (error) {
    console.error('Error handling audio upload:', error);
    return res.status(500).json({ error: 'Server error while handling audio upload.' });
  }
})

// ... (rest of your code)
// ... (rest of your code)



// ... (rest of your code)


app.use('/uploads', express.static('uploads'));

const URI = process.env.MONGODB_URL

mongoose.connect(URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Failed to connect to MongoDB:', error);
  });
  

  if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'))
    })
}



http.listen(5000,() => {
    console.log("server run on port 5000")
})