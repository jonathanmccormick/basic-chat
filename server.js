var express = require('express')
var bodyParser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')
const { readFileSync } = require('fs')

// Middleware
app.use(express.static(__dirname))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false})) 
mongoose.Promise = Promise

// DB access
var config = require('./config.json')
var dbUrl = `mongodb+srv://${config.DbUsername}:${config.DbPassword}@cluster0.thifd.mongodb.net/<dbname>?retryWrites=true&w=majority`

var Message = mongoose.model('Message', {
    name: String,
    message: String
})

// Routes
app.get('/messages', (req, res) => {
    Message.find({ }, (error, messages) => {
        console.log(messages)
        res.send(messages)
    }).catch((error) => {
        console.log(error)
    })
})

app.post('/messages', (req, res) => {
    var message = Message(req.body)
    message.save().then(() => {
        io.emit('message', req.body)
        console.log(req.body)
        res.sendStatus(200)
    }).catch((eror) => {
        console.log(error)
        sendStatus(500)
    })
})

io.on('connection', (socket) => {
    console.log('a user connected')
})

mongoose.connect(dbUrl, { useUnifiedTopology: true, useNewUrlParser: true }, (error) => {
    if (error) {
        console.log(error)
    } else {
        console.log('mongodb connected')
    }
})

// Server
var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
})