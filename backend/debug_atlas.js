const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB Atlas Connection...');
const uri = process.env.MONGODB_URI;
console.log('URI:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in log

async function testConnection() {
    try {
        await mongoose.connect(uri);
        console.log('✅ Connected to MongoDB Atlas!');

        const admin = new mongoose.mongo.Admin(mongoose.connection.db);
        const dbs = await admin.listDatabases();
        console.log('📂 Available Databases:');
        dbs.databases.forEach(db => console.log(` - ${db.name}`));

        console.log(`\n👉 Current Database: ${mongoose.connection.name}`);

        // Check collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📚 Collections in current DB:');
        collections.forEach(c => console.log(` - ${c.name}`));

        // Test Insert
        const TestContact = mongoose.model('Contact', new mongoose.Schema({
            name: String,
            email: String,
            message: String,
            date: { type: Date, default: Date.now }
        }), 'contacts'); // Force collection name

        const testMsg = new TestContact({
            name: 'Debug Bot',
            email: 'debug@test.com',
            message: 'This is a test message to verify database write access.'
        });

        const savedMsg = await testMsg.save();
        console.log('\n✅ Test Data Inserted Successfully!');
        console.log('ID:', savedMsg._id);

        // Cleanup
        await TestContact.deleteOne({ _id: savedMsg._id });
        console.log('🗑️ Test Data Cleaned up.');

    } catch (err) {
        console.error('❌ Connection or Operation Failed:', err);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected.');
    }
}

testConnection();
