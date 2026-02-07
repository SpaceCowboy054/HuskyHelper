require('dotenv').config();
const express = require("express");
const app = express();
const pg = require('pg');
const cors = require('cors');
const qs = require('qs')
app.use(cors({ origin: 'http://localhost:3000' }));

let connectionString = process.env.DATABASE_URL;
const client = new pg.Client(connectionString);
client.connect();

app.listen(process.env.SERVER_PORT, () => {
    console.log("server started");
})

app.use(express.json())
app.set('query parser',(str) => qs.parse(str))

express.Router().use((req, res, next) => {
  console.log(`Entered index router: ${req.method} ${req.url}`);
  next();
});


const indexRouter = require('./routes/index.js');
const searchRouter = require('./routes/search.js');
const adminRouter = require('./routes/admin.js');
const authentication = require('./auth.js');
app.use('/admin', authentication, adminRouter)
app.use('/search', searchRouter)
app.use('/', indexRouter)

module.exports = client;