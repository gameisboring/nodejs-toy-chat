// @ts-check
const { MongoClient } = require('mongodb')
const uri =
  'mongodb+srv://root-user:1111@cluster0.8mumx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const client = new MongoClient(uri, {
  // @ts-ignore
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

module.exports = client
