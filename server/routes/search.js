const express = require('express')
const router = express.Router() 
const client = require("../connection")

// Get all courses and sections for that course -- returns an array of [course, [section1,section2, sectionN]] pairs
router.get('/', async (req, res) =>{
    try{
        let { subject, searchtext, attrs } = req.query;
        //attrsArray = ["storrs", "waterbury", "hartford", "avery point", "stamford","q","w","e","ca1","ca2","ca3","ca4","ca4int","toi1","toi2","toi3","toi4","toi5","toi6"]
        //                  0           1           2           3               4     5   6   7    8     9      10  11      12      13      14     15    16     17      18
        // get content area query
        let selectedContentAreas = [];
        for(let i = 0; i <= 4; i++){
            if(attrs[i+8] == "1"){
                if(i==4){selectedContentAreas.push(`CA4INT = TRUE`)}
                else{selectedContentAreas.push(`CA${i+1} = TRUE`)}
            }
        }

        // get topics of inquiry query
        let selectedTopicsOfInquiry = [];
        for(let i = 0; i <= 5; i++){
            if(attrs[13+i] == "1"){selectedTopicsOfInquiry.push(`TOI${i+1} = TRUE`)}
        }

        // get other attributes - quantatative writing and environmental
        let selectedQWE = [];
        if(attrs[5] == "1"){selectedQWE.push(`quantatative = TRUE`)}
        if(attrs[6] == "1"){selectedQWE.push(`writing = TRUE`)}
        if(attrs[7] == "1"){selectedQWE.push(`environmental = TRUE`)}

        // create a query based on user inputs
        // course attributes are everything but the campus
        // section attributes are only the campus
        let courseQueryString = `SELECT * FROM courses c JOIN subjects s on c.subject_id = s.subject_id WHERE LOWER(s.abbreviation) LIKE $1 AND LOWER(${isNaN(searchtext) ? "course_name" : "catalog_number"}) LIKE $2`

        let selectedArrays = [selectedContentAreas, selectedTopicsOfInquiry, selectedQWE]
        for(arr of selectedArrays){
            if(arr.length > 0){
                courseQueryString += " AND ";
                courseQueryString += arr.join(' AND ');
            }
        }

        courseQueryString += " ORDER BY s.abbreviation, catalog_number LIMIT 100 ";
        console.log(courseQueryString)

        // we use prepared statements to prevent SQL injection for searchtext and subject
        if(searchtext === undefined){searchtext = ""}
        if(subject === undefined){subject = ""}
        const values = [`%${subject.toLowerCase()}%`, `%${searchtext.toLowerCase()}%`]
        const courseQuery = await client.query(courseQueryString, values);

        // make section query
        let sectionQueryString = "SELECT * FROM sections s WHERE course_id = ";
        let sectionQueryStringCampus = "";
        let selectedCampuses = [];
        if(attrs[0] == "1"){selectedCampuses.push(`"campus" like '%STORR%'`)}
        if(attrs[1] == "1"){selectedCampuses.push(`"campus" like '%WTBY%'`)}
        if(attrs[2] == "1"){selectedCampuses.push(`"campus" like '%HRTFD%'`)}
        if(attrs[3] == "1"){selectedCampuses.push(`"campus" like '%STMFD%'`)}
        if(attrs[4] == "1"){selectedCampuses.push(`"campus" like '%AVYPT%'`)}
        if(selectedCampuses.length > 0){sectionQueryStringCampus += selectedCampuses.join(' OR ');}

        let courseSectionArray = [];
        for(const row of courseQuery.rows){
            // console.log(sectionQueryString + `${row.course_id} AND (` + sectionQueryStringCampus + ")")
            const sectionQuery = await client.query(sectionQueryString + `${row.course_id} AND (` + sectionQueryStringCampus + ")")
            courseSectionArray.push([row, sectionQuery.rows])
            // console.log(sectionQuery.rows)
        }
        console.log(courseSectionArray[0])
        console.log(courseSectionArray[1])
        res.json(courseSectionArray)
    }
    catch (err){
        console.error(err);
        res.status(500).send(err);
    }
})

module.exports = router;