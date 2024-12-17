const express = require('express');
const cors = require('cors');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json('Test' );
});
app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
});
