// Import dependencies
const express = require('express');
const { MongoClient } = require('mongodb');

// MongoDB Atlas connection URI (replace with your actual URI)
const uri = 'mongodb+srv://testuser:tzbUABhzakurvy2a@cluster0.ifczn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

// Database and Collection Names
const dbName = 'weatherApp';
const collectionName = 'favorites';

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to the MongoDB database
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error);
    }
}

// API Endpoint to Add a New Favorite City
app.post('/favorites', async (req, res) => {
    const { city, state, latitude, longitude } = req.body;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const favoriteCity = {
        counter: await collection.countDocuments() + 1,
        city,
        state,
        latitude,
        longitude,
        added_at: new Date(),
    };

    try {
        const result = await collection.insertOne(favoriteCity);
        res.status(201).json({ message: 'Favorite city added', id: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add favorite city' });
    }
});

// API Endpoint to Get All Favorite Cities
app.get('/favorites', async (req, res) => {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        const favorites = await collection.find().toArray();
        res.status(200).json(favorites);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch favorite cities' });
    }
});

// API Endpoint to Remove a Favorite City by Counter
app.delete('/favorites/:counter', async (req, res) => {
    const counter = parseInt(req.params.counter, 10);
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        const result = await collection.deleteOne({ counter });
        if (result.deletedCount === 1) {
            res.status(200).json({ message: 'Favorite city removed' });
        } else {
            res.status(404).json({ error: 'Favorite city not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove favorite city' });
    }
});

// Endpoint to check if a city exists; if not, insert it, otherwise delete it
app.post('/favorites/check', async (req, res) => {
    const { city, state, latitude, longitude } = req.body;
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        // Check if the city exists in the collection
        const existingCity = await collection.findOne({ city, state });

        if (existingCity) {
            // City exists; delete it
            await collection.deleteOne({ city, state });
            res.status(200).json({ message: 'City found and deleted from favorites' });
        } else {
            // City does not exist; insert it
            const favoriteCity = {
                counter: await collection.countDocuments() + 1,
                city,
                state,
                latitude,
                longitude,
                added_at: new Date(),
            };

            const result = await collection.insertOne(favoriteCity);
            res.status(201).json({ message: 'City added to favorites', id: result.insertedId });
        }
    } catch (error) {
        res.status(500).json({ error: 'Operation failed', details: error.message });
    }
});


// Start the server and connect to the database
app.listen(port, async () => {
    await connectToDatabase();
    console.log(`Server is running on http://localhost:${port}`);
});
