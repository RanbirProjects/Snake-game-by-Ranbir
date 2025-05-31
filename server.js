const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/snake-game', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Score Schema
const scoreSchema = new mongoose.Schema({
    playerName: String,
    score: Number,
    date: {
        type: Date,
        default: Date.now
    }
});

const Score = mongoose.model('Score', scoreSchema);

// Routes
app.get('/api/scores', async (req, res) => {
    try {
        const scores = await Score.find().sort({ score: -1 }).limit(10);
        res.json(scores);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/scores', async (req, res) => {
    const score = new Score({
        playerName: req.body.playerName,
        score: req.body.score
    });

    try {
        const newScore = await score.save();
        res.status(201).json(newScore);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 