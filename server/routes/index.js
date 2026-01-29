const express = require('express')
const router = express.Router() 
const client = require("../connection")

// Get all subjects
router.get('/', async(req, res) =>{
    try{
        const query = await client.query("SELECT * FROM subjects");
        res.send(query.rows);
    }
    catch(err){
        console.error(err);
        res.status(500).send("Database error");
    }
})

module.exports = router;