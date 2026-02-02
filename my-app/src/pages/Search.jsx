import SearchForm from "../components/SearchForm";
import TableRow from "../components/TableRow";
import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';

export default function Search(){
    const [queryResults, setQueryResults] = useState([]);
    const location = useLocation();
    useEffect(() =>{
        async function getQueryResults(){
            // query our search results on this page on first load and subsequent user queries
            const queryPromise = await fetch(`http://localhost:5000/search` + window.location.search);
            setQueryResults(await queryPromise.json());
        }
        getQueryResults();
    }, [location.search])

    useEffect(()=>{
        console.log(queryResults)
    }, [queryResults])

    return (
        <>
            <SearchForm className = "m-4"/>
            <h2 className = "flex text-white justify-center">Please understand that this information is second-hand and may not be completely accurate. Please use official UCONN data when making course decisions</h2>
            <div className = "justify-items-center">
                <TableRow headerRow = "true"></TableRow>
                {queryResults.map((item, index) => 
                    <TableRow jsondata = {item} renderScheduleButton = {false} ></TableRow>
                )}
            </div>
        </>
    )
}
