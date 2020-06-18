require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const Person = require('./models/person')
const { response } = require('express')

mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true);

app.use(express.json()) 
//app.use(morgan('tiny'))
app.use(express.static('build'))

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :response-time ms :body'))

app.use(cors())

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
      },
      {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
      },
      {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
      },
      {
        "name": "Mary Poppendieck",
        "number": "39-23-6423123",
        "id": 4
      }
]

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
  
})

app.get('/api/persons/:id', (req, res) => {
  Person.findById(req.params.id)
  .then(person => {
      if(person){
        res.json(person)
      } else {
        res.status(404).end()
      }
    
    })
    .catch(error => next(error))
  })


app.get('/info', (req, res) => {
    
    Person.countDocuments({}).then(count => {
      console.log(count)
      const currentDate = new Date()
      res.send(`<p>Phonebook has info for ${count} people</p><p>${currentDate}</p>`)
    })
    

    

})

app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndDelete(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (req, res, next) => {

    const body = req.body

    if(body.name === undefined){
        return res.status(400).json({ 
            error: 'name missing' 
          })
    }

    if(body.number === undefined){
        return res.status(400).json({ 
            error: 'number missing' 
          })
    }

    const person = new Person({
      name: body.name,
      number: body.number
    })

    person
    .save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => {
      res.json(savedAndFormattedPerson)
    })
    .catch(error => next(error))
    
})

app.put('/api/persons/:id', (req, res, next) => {
  const body = req.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if(error.name === 'ValidationError'){
    return res.status(400).json({error: error.message})
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})