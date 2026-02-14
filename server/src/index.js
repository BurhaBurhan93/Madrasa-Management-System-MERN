const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

require('dotenv').config();

const app = express();

app.use(cors());        // allow frontend requests
app.use(express.json()); // parse JSON body

connectDB();           // connect to MongoDB

// Import routes
const studentRoutes = require('./routes/studentRoutes');

// Use routes
app.use('/api/student', studentRoutes);

app.get('/', (req, res) => {
  res.send('Backend connected to MongoDB (madrasa-mis)!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
