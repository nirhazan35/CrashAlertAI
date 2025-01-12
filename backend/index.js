const express = require('express');
const cors = require('cors');
const connectDB = require('./src/db');
const cookieParser = require('cookie-parser');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());


// Connect to MongoDB
connectDB();

// Routes
// app.use('/api/accidents', require('./routes/accidents'));
// //app.use('/api/users', require('./routes/users'));
// app.use('/api/auth', require('./routes/auth'));
app.use('/accidents', require('./routes/accidents'));
app.use('/users', require('./routes/users'));
app.use('/auth', require('./routes/auth'));

app.get('/', (req, res) => {
  res.send('CrashAlertAI Backend is running!');
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
