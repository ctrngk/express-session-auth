const express = require('express')
const app = express()
const port = parseInt(process.env.PORT, 10) || 3000
const bodyParser = require('body-parser');
const axios = require("axios")
const path = require("path")
const userEndPoint = "http://localhost:3030/users"
const getUsersDB = async () => (await axios.get(userEndPoint)).data

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

const authenticateSession = (req, res, next) => {
    if (req.session.loggedin) {
        next()
    } else {
        res.status(401)
        res.send('Please login to view this page!');
        res.end();
    }
}

app.get('/', function (request, response) {
    response.sendFile(path.join(__dirname + '/home.html'));
});
app.post('/login', async (request, response) => {
    const username = request.body.username
    const password = request.body.password
    console.log({username})
    console.log({password})
    const usersDB = await getUsersDB()
    console.log({usersDB})
    const user = usersDB.find(u => u.username === username && u.password === password)
    if (user) {
        request.session.loggedin = true;
        request.session.username = username;
        response.redirect('/dashboard');
    } else {
        response.send('Incorrect Username and/or Password!');
    }
    response.end()
})
app.get('/dashboard', authenticateSession, function(req, res) {
    res.send(`hello world, ${req.session.username}`);
});


app.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
})
