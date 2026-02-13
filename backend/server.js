const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
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

// Check if we are in Vercel environment (optional, but good for connection management)
// Vercel serverless functions might reuse DB connection if we cache it, but Mongoose handles it reasonably well.
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB: portofolio');
        seedDatabase();
    })
    .catch(err => console.error('Could not connect to MongoDB:', err));

// Nodemailer Config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Seeding logic
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

// Routes
app.get('/', (req, res) => {
    res.send('Portfolio Backend is Running');
});

// 1. Visit Log
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

// 2. Contact Form
app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const newMessage = new Contact({ name, email, message });
        await newMessage.save();

        let emailSent = false;
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS && !process.env.EMAIL_USER.includes('your-email')) {
            try {
                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: 'rismamerlindaa@gmail.com',
                    subject: `New Inquiry from ${name}`,
                    text: `You have a new message from your portfolio contact form:\n\nName: ${name}\nEmail: ${email}\nMessage: ${message}`
                };
                await transporter.sendMail(mailOptions);
                console.log('Email sent successfully');
                emailSent = true;
            } catch (emailErr) {
                console.warn('Email send failed but message saved:', emailErr);
            }
        }

        res.status(201).json({
            message: 'Message saved successfully',
            data: newMessage,
            emailSent: emailSent
        });
    } catch (err) {
        console.error('Error in /api/contact:', err);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// 3. Projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.get('/api/admin/messages', async (req, res) => {
    try {
        const messages = await Contact.find().sort({ date: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Export the app for Vercel
module.exports = app;

// Listen only if running directly
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Backend running at http://localhost:${PORT}`);
    });
}



