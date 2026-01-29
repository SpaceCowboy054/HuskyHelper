const express = require("express");
const app = express();
const pg = require('pg');
const cors = require('cors');
const qs = require('qs')
app.use(cors({ origin: 'http://localhost:3000' }));


let connectionString = "postgres://postgres:at04Graham@localhost:5432/postgres";
const client = new pg.Client(connectionString);
client.connect();

app.listen(5000, () => {
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
app.use('/search', searchRouter)
app.use('/', indexRouter)

module.exports = client;

// async function queryDSA(){
//     const query = await client.query("SELECT * FROM courses c JOIN subjects s on c.subject_id = s.subject_id WHERE course_name ilike '%C++%'");
//     console.log(query.rows[0]);
// }

// queryDSA();