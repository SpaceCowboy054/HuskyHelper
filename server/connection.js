const { Pool } = require('pg');

const pool = new Pool({
  connectionString: "postgres://postgres:at04Graham@localhost:5432/postgres"
});

module.exports = pool;