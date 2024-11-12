// Import MongoDB client
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://testuser:tzbUABhzakurvy2a@cluster0.ifczn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Create a new MongoClient
const client = new MongoClient(uri);

// Database and Collection Names
const dbName = 'weatherApp';
const collectionName = 'favorites';

async function connectToDatabase() {
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB Atlas');
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas:', error);
    }
}

// Function to add a new favorite city
async function addFavorite(city, state, latitude, longitude) {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Construct the document to insert
    const favoriteCity = {
        counter: await collection.countDocuments() + 1, // Incrementing counter
        city,
        state,
        latitude,
        longitude,
        added_at: new Date()
    };

    // Insert the document
    const result = await collection.insertOne(favoriteCity);
    console.log(`New favorite city added with ID: ${result.insertedId}`);
}

// Function to get all favorite cities
async function getFavorites() {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Retrieve all documents in the collection
    const favorites = await collection.find().toArray();
    console.log('Favorite Cities:', favorites);
    return favorites;
}

// Function to remove a favorite city by its counter or ID
async function removeFavorite(counter) {
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Delete the document with the specified counter
    const result = await collection.deleteOne({ counter });
    console.log(`Favorite city removed: ${result.deletedCount} document(s)`);
}

// Example usage
(async () => {
    await connectToDatabase();

    // Add a favorite city
    await addFavorite('Los Angeles', 'California', 34.0522, -118.2437);
    const favorites = await getFavorites();
    console.log(favorites);

    await client.close();
})();
