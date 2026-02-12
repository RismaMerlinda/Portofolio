const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Project = require('./models/Project');
const Contact = require('./models/Contact');
const Visitor = require('./models/Visitor');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portofolio';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB: portofolio');
        seedDatabase();
    })
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Seeding logic (one-time if empty)
async function seedDatabase() {
    try {
        const projectCount = await Project.countDocuments();
        if (projectCount === 0) {
            const DB_PATH = path.join(__dirname, 'db.json');
            if (fs.existsSync(DB_PATH)) {
                const data = JSON.parse(fs.readFileSync(DB_PATH));
                if (data.projects && data.projects.length > 0) {
                    await Project.insertMany(data.projects.map(p => ({
                        title: p.title,
                        description: p.description,
                        stack: p.stack,
                        github: p.github,
                        image: p.image
                    })));
                    console.log('Database seeded with projects from db.json');
                }
            }
        }
    } catch (err) {
        console.error('Error seeding database:', err);
    }
}

// 1. Visit Log - Track who opens the site
app.post('/api/visit', async (req, res) => {
    try {
        const newVisit = new Visitor({
            userAgent: req.headers['user-agent'],
            ip: req.ip
        });
        await newVisit.save();
        res.status(200).json({ message: 'Visit logged' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to log visit' });
    }
});

// 2. Contact Form - Save messages
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newMessage = new Contact({ name, email, message });
        await newMessage.save();
        res.status(201).json({ message: 'Message saved successfully', data: newMessage });
    } catch (err) {
        res.status(500).json({ error: 'Failed to save message' });
    }
});

// 3. Projects list - GET all projects (Dynamic)
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Admin Route to view messages
app.get('/api/admin/messages', async (req, res) => {
    try {
        const messages = await Contact.find().sort({ date: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
});
