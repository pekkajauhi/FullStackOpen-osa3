const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()


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
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)
    if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    
  })


app.get('/info', (req, res) => {
    const personsLength = persons.length
    const currentDate = new Date()

    res.send(`<p>Phonebook has info for ${personsLength} people</p><p>${currentDate}</p>`)

})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(p => p.id !== id)
  
    res.status(204).end()
})

app.post('/api/persons', (req, res) => {

    const body = req.body

    if(!body.name){
        return res.status(400).json({ 
            error: 'name missing' 
          })
    }

    if(!body.number){
        return res.status(400).json({ 
            error: 'number missing' 
          })
    }

    const names = persons.map(p => p.name)
    if(names.includes(body.name)){
        return res.status(422).json({ 
            error: 'name must be unique' 
          })
    }

    const person = req.body
    person.id = Math.floor(Math.random() * Math.floor(1000))

    persons = persons.concat(person)
    console.log(persons)

    res.json(person)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})