if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const Person = require('./models/person')

const logger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(express.static('build'))
app.use(bodyParser.json())
app.use(logger)

morgan.token('body', function(req, res){return JSON.stringify(req.body)})
app.use(morgan(':method :url :status :response-time ms :res[content-length] :body'))

app.get('/info', (request, response, next) => {
  const size = db.collection.size()
  send(size)
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  })
})

app.get('/api/persons/:id', (req, res, next) => {
  const id = Number(req.params.id)
  Person.findById(req.params.id) 
    .then(person => {
      if(person) {
        res.json(person.toJSON())
      } else {
        res.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const name = body.name
  const number = request.body.number

  const person = {
    name: name,
    number: number,
    date: new Date(),
  }

  Person.findByIdAndUpdate(request.params.id, person, {new: true})
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})


app.post('/api/persons', (request, response, next) => {
  
  const body = request.body
  const name = request.body.name
  const number = request.body.number

  const person = new Person ({
    name: name,
    number: number,
    date: new Date(),    
  })
  person.save().then(savedPerson => {
    response.json(savedPerson.toJSON())
  }).catch(error => next(error)) 
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({error: 'unknown endpoint'})
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({error:'malformatted id'})
  
  } else if (error.name === 'ValidationError' ) {
    return response.status(400).send({error: error.message})
  }
  next(error)

  
}

app.use(errorHandler)


const PORT = process.env.PORT 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})