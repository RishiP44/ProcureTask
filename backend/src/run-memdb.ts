import { MongoMemoryServer } from 'mongodb-memory-server';

async function start() {
    try {
        console.log('Starting MongoDB Memory Server on port 27017...');
        const mongod = await MongoMemoryServer.create({
            binary: {
                version: '4.4.24'
            },
            instance: {
                port: 27017,
                dbName: 'procuretrack'
            }
        });
        console.log(`\n✅ MongoDB Memory Server started successfully!`);
        console.log(`URI: ${mongod.getUri()}`);
        console.log('Database name: procuretrack');
        console.log('\n👉 KEEP THIS PROCESS RUNNING. Closing this will stop the database.');
    } catch (err) {
        console.error('❌ Failed to start MongoDB Memory Server:', err);
        process.exit(1);
    }
}

start();
