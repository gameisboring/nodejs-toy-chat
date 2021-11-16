// @ts-check
const { MongoClient } = require('mongodb')
const uri =
  'mongodb+srv://root-user:1111@cluster0.8mumx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
const client = new MongoClient(uri, {
  // @ts-ignore
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
async function main() {
  const c = await client.connect()

  const users = client.db('fc21').collection('users')
  const cities = client.db('fc21').collection('cities')
  // Delete
  await users.deleteMany({})
  await cities.deleteMany({})

  // Init
  await cities.insertMany([
    {
      name: '서울',
      population: 1000,
    },
    {
      name: '인천',
      population: 200,
    },
    {
      name: '부산',
      population: 350,
    },
    {
      name: '뉴욕',
      population: 100,
    },
  ])

  await users.insertMany([
    {
      name: 'foo',
      birthYear: 2000,
      contacts: [
        { type: 'phone', number: '+821000001111' },
        { type: 'home', number: '0321114444' },
      ],
      city: '서울',
    },
    {
      name: 'bar',
      birthYear: 1994,
      contacts: [{ type: 'phone', number: '+8215151515' }],
      city: '부산',
    },
    { name: 'Bax', birthYear: 1990, city: '인천' },
    { name: 'Poo', birthYear: 1993, city: '뉴욕' },
  ])
  // Update
  users.updateOne(
    {
      name: 'Bax',
    },
    {
      $set: {
        name: 'Boo',
      },
    }
  )
  // Delete
  await users.deleteOne({
    name: 'par',
  })
  // Read
  /* const cursor = users.find(
    {
      birthYear: {
        $gte: 1990,
      },
    },
    {
      sort: {
        birthYear: -1,
      },
    }
  ) */
  const cursor = users.aggregate([
    {
      $lookup: {
        from: 'cities',
        localField: 'city',
        foreignField: 'name',
        as: 'city_info',
      },
    },
    {
      $match: {
        $or: [
          {
            'city_info.population': {
              $gte: 100,
            },
            birthYear: {
              $gte: 1992,
            },
          },
        ],
      },
    },
    {
      $count: 'num_users',
    },
  ])

  await cursor.forEach(console.log)

  await client.close()
}
main()
