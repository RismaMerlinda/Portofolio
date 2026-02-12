const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Project = require('./models/Project');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/oortofolio';

async function seedAll() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing projects
        await Project.deleteMany({});
        console.log('Cleared existing projects.');

        // Read db.json
        const dbPath = path.join(__dirname, 'db.json');
        const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
        const projects = data.projects;

        if (projects && projects.length > 0) {
            await Project.insertMany(projects.map(p => ({
                title: p.title,
                description: p.description,
                stack: p.stack,
                github: p.github,
                demo: p.demo,
                image: p.image
            })));
            console.log(`Seeded ${projects.length} projects successfully.`);
        } else {
            console.log('No projects found in db.json to seed.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
}

seedAll();
