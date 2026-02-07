// This file is to contain some server-side logic for the CRUD logic of the database
// The scraper will automatically scrape the data and then call the necessary methods in this file to
// compare the old data to the new data, and see what has changed and update the database if necessary

const express = require('express')
const router = express.Router() 
const client = require("../connection")

// ------------- Subjects Table --------------
// Get all subjects that have the same name or abbrievated name
router.get('/subjects', async(req, res) =>{
    try{
        let name = undefined;
        let abbr = undefined;
        
        if (req.body) {
            name = req.body.name
            abbr = req.body.abbr
        }
        
        // Get all if no name, abbr
        if (!name && !abbr) {
            const query = await client.query(`SELECT * FROM subjects`);
            return res.json(query.rows);
        }
        
        const query = await client.query(
            `SELECT * FROM subjects 
            WHERE abbreviation = $1 OR LOWER(name) = $2`,
            [(abbr || '').toUpperCase(), (name || '').toLowerCase()]
        );
        res.json(query.rows);
    }
    catch(err){
        console.error(err);
        res.status(500).send("Database error");
    }
})

// Patch requires all columns
router.patch('/subjects', async(req, res) =>{
    try{
        let { subject_id, name, abbr } = req.body;
        const query = await client.query(
            `UPDATE subjects
            SET abbreviation = $1, name = $2 
            WHERE subject_id = $3
            RETURNING *`,
            [abbr.toUpperCase(), name, subject_id]
        );
        res.json(query.rows);
    }
    catch(err){
        console.error(err);
        res.status(500).send("Database error");
    }
})

// Delete based on subject_id
router.delete('/subjects', async(req, res) =>{
    try{
        let { subject_id } = req.body;
        const query = await client.query(
            `DELETE FROM subjects
            WHERE subject_id = $1
            RETURNING *`,
            [subject_id]
        );
        res.json(query.rows);
    }
    catch(err){
        console.error(err);
        res.status(500).send("Database error");
    }
})

// Post (auto-increment)
router.post('/subjects', async(req, res) =>{
    try{
        let { name, abbr } = req.body;
        const query = await client.query(
            `INSERT INTO subjects (name, abbreviation)
            VALUES ($1, $2)
            RETURNING *`,
            [name, abbr.toUpperCase()]
        );
        res.json(query.rows);
    }
    catch(err){
        console.error(err);
        res.status(500).send("Database error");
    }
})

// ------------- Courses Table --------------

// ------------- Sections Table --------------

// router.get('/', async(req, res) =>{
//     try{
//         const query = await client.query("SELECT * FROM subjects");
//         res.send(query.rows);
//     }
//     catch(err){
//         console.error(err);
//         res.status(500).send("Database error");
//     }
// })

module.exports = router;