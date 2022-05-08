const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


//////////////////////////////////////////
//JWT Verification
//////////////////////////////////////////
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.send({ message: 'forbidden access' })
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })

}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0vraz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const fruitCollection = client.db('fruitWarehouse').collection('fruit');
        const fruitOperationCollection = client.db('fruitOperation').collection('operation');


        ////////////////
        //AUTH token
        /////////////////
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        });


        ///////////////////////////
        //Getting all data from db
        ///////////////////////////
        app.get('/fruit', async (req, res) => {
            const query = {};
            const cursor = fruitCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits);
        });
        app.get('/operation', async (req, res) => {
            const query = {};
            const cursor = fruitOperationCollection.find(query);
            const operations = await cursor.toArray();
            res.send(operations);
        });


        //////////////////////////////////////////
        //Getting  data with specific id  from db
        //////////////////////////////////////////
        app.get('/fruit/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const fruit = await fruitCollection.findOne(query);
            res.send(fruit);
        });

        //////////////////////////////////////////
        //Update  data with specific id  in db
        //////////////////////////////////////////
        app.put('/fruit/:id', async (req, res) => {
            const id = req.params.id;
            const updateQuantty = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updateQuantty.quantity,
                    sold: updateQuantty.sold
                }
            };
            const result = await fruitCollection.updateOne(filter, updatedDoc, options)
            res.send(result);
        });

        //////////////////////////////////////////
        //Delete  data with specific id  from db
        //////////////////////////////////////////
        app.delete('/fruit/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await fruitCollection.deleteOne(query);
            res.send(result);
        });

        //////////////////////////////////////////
        //Create new data  in db
        //////////////////////////////////////////
        app.post('/fruitinfo', async (req, res) => {
            const newFruit = req.body;
            console.log('adding', newFruit);
            const result = await fruitCollection.insertOne(newFruit);
            res.send(result);
        });

        //////////////////////////////////////////
        //JWT verification and Get fdata from db
        //////////////////////////////////////////
        app.get('/item', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email }
                const cursor = fruitCollection.find(query);
                const items = await cursor.toArray();
                res.send(items);
            }
            else {
                res.send({ message: 'forbidden access' });
            }
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