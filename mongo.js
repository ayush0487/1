import { MongoClient } from 'mongodb'
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);
const dbName = 'mydatabase';

async function run() {
  try {
    await client.connect();
    console.log('Connected successfully to server');

    const db = client.db(dbName);
    const collection = db.collection('documents'); 

  
    const insertResult =  await collection.insertMany([
  { name: "Ayush", age: 20 },
  { name: "Rahul", age: 22 },
  { name: "Priya", age: 21 }
]);
  await collection.deleteMany({gender: "male"}
);


    console.log('Inserted document =>', insertResult);

    
    const findResult = await collection.find().toArray(); 
    console.log('Found documents =>', findResult);

  } finally {
    await client.close();
  }
}

run()
