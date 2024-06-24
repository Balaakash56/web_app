const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const app = express();
app.use(express.json());

// MongoDB setup
mongoose.connect('YOUR_MONGODB_CONNECTION_STRING', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const fileSchema = new mongoose.Schema({
  filename: String,
  url: String,
  userId: mongoose.Schema.Types.ObjectId
});

const User = mongoose.model('User', userSchema);
const File = mongoose.model('File', fileSchema);

// Google Cloud Storage setup
const storage = new Storage({
  keyFilename: path.join(__dirname, 'YOUR_SERVICE_ACCOUNT_KEY_FILE.json')
});

const bucket = storage.bucket('YOUR_BUCKET_NAME');

// Middleware for handling file uploads
const upload = multer({
  storage: multer.memoryStorage()
});

// Routes
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  res.send('User registered');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (!user) return res.status(401).send('Invalid credentials');
  const token = jwt.sign({ userId: user._id }, 'YOUR_SECRET_KEY');
  res.send({ token });
});

const authenticate = (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, 'YOUR_SECRET_KEY');
    req.userId = decoded.userId;
    next();
  } catch (e) {
    res.status(401).send('Please authenticate');
  }
};

app.post('/upload', authenticate, upload.single('file'), (req, res) => {
  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on('error', err => res.status(500).send(err));
  blobStream.on('finish', async () => {
    const url = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    const file = new File({ filename: req.file.originalname, url, userId: req.userId });
    await file.save();
    res.send({ url });
  });

  blobStream.end(req.file.buffer);
});

app.get('/files', authenticate, async (req, res) => {
  const files = await File.find({ userId: req.userId });
  res.send(files);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
