

const mongoose = require('mongoose')

if (process.argv.length <3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

mongoose.connect(url,  {useNewUrlParser: true})

const personSchema = new mongoose.Schema({
  name: String,
  date: Date,
  number: Number,
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Person = mongoose.model('Person', personSchema)
const name = process.argv[3]
const number = process.argv[4]

const person = new Person({
  name: name,
  date: new Date(),
  number: number,
})

if (name === undefined) {
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person.name, person.number) 
    })
    mongoose.connection.close()
  })
}

if (name !== undefined) {
  person.save().then(response => {
    console.log(`lisätään ${name} numero ${number}`)
    mongoose.connection.close()
  })
}

