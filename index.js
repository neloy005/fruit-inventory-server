const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0vraz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const fruitCollection = client.db('fruitWarehouse').collection('fruit');

        app.get('/fruit', async (req, res) => {
            const query = {};
            const cursor = fruitCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits);
        })
    }
    finally {

    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Fruit warehouse is running');
});

app.listen(port, () => {
    console.log('Listening port no: ', port);
})