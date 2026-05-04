
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const Database = require('./config/db');

dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
//app.use('/api/tasks', require('./routes/taskRoutes'));

app.use(express.static(path.join(__dirname, '../frontend/build')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')));

// Export the app object for testing
if (require.main === module) {
    Database.getInstance().connect();
    // If the file is run directly, start the server
    const PORT = process.env.PORT || 6001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  }


module.exports = app
