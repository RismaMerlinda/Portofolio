const mongoose = require('mongoose');
require('dotenv').config();
const Project = require('./models/Project');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/oortofolio';

async function checkDb() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const count = await Project.countDocuments();
        console.log(`Total projects: ${count}`);

        const projects = await Project.find();
        console.log(JSON.stringify(projects, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkDb();
