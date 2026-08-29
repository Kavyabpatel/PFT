const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Suppress Mongoose exact warnings and setup reliable connection
        mongoose.set('strictQuery', false);

        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // These are included by default in Mongoose 6+, but explicitly marking them as optimal for older versions
            serverSelectionTimeoutMS: 5000, 
        });

        console.log(`[MongoDB] Database Connected Successfully: ${conn.connection.host}`);

        // Set up robust connection lifecycle listeners
        mongoose.connection.on('error', (err) => {
            console.error(`[MongoDB] Connection Error: ${err.message}`);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('[MongoDB] Database Disconnected! Attempting to reconnect...');
        });

        // Optional: Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('[MongoDB] Connection closed due to application termination');
            process.exit(0);
        });

    } catch (error) {
        console.error(`[MongoDB] Initialization Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
