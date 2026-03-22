const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017/duinophile';
const mongoUri =
  (process.env.MONGODB_URI && process.env.MONGODB_URI.trim()) ||
  DEFAULT_MONGODB_URI;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const postRoutes = require('./src/routes/postRoutes');
const userRoutes = require('./src/routes/userRoutes');
const errorHandler = require('./src/middleware/errorHandler');
const User = require('./src/models/User');

const DEMO_USER_ID = '507f1f77bcf86cd799439011';

const ensureDemoUser = async () => {
  try {
    const existing = await User.findById(DEMO_USER_ID);
    if (existing) {
      console.log(`Demo user exists: ${DEMO_USER_ID}`);
      return;
    }
    await User.create({
      _id: DEMO_USER_ID,
      name: 'Sukirthan',
      email: 'sukirthan@gmail.com',
      bio: 'Arduino enthusiast & maker',
      streak: 7,
    });
    console.log(`Demo user created: ${DEMO_USER_ID}`);
  } catch (error) {
    if (error.code === 11000) {
      console.log('Demo user email conflict — skipping seed');
    } else {
      console.error('Demo user error:', error.message);
    }
  }
};

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: ' Duinophile API is running!',
    version: '1.0.0',
  });
});

app.use(errorHandler);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`MongoDB database: ${mongoose.connection.name}`);
    if (!process.env.MONGODB_URI?.trim()) {
      console.log(
        'Using default local MongoDB URI. Set MONGODB_URI in .env to override.',
      );
    }
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    console.error(
      'Start MongoDB locally, or set MONGODB_URI in DuinophileBackend/.env',
    );
    console.error(
      'Example: docker compose -f DuinophileBackend/docker-compose.yml up -d',
    );
    process.exit(1);
  }
};

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => ensureDemoUser())
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API: http://localhost:${PORT}`);
      console.log(
        'Listening on 0.0.0.0 (reachable from emulators and LAN devices)',
      );
    });
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });