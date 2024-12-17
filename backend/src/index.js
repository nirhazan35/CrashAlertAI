const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const port = 3001;

// Test login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Testing authentication with jwt and roles
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ role: 'admin' }, 'secretKey', { expiresIn: '1h' });
    return res.json({ token });
  }
  if (username === 'user' && password === 'password') {
    const token = jwt.sign({ role: 'user' }, 'secretKey', { expiresIn: '1h' });
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
