const MongoClient = require('mongodb').MongoClient
const MONGO_URL = process.env.MONGO_URL

const client = new MongoClient(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

module.exports = async app => {
  if(!client.isConnected()) await client.connect()
  const db = client.db('bookmark')
  app.reddit = db.collection('reddit')
  console.log('db connected')
}