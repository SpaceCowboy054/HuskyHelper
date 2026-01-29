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


/*
in scheduler, select which saved classes you want to be added to your schedule.
plus/minus for adding it to current course scheduler

remove all scheduleSections when you remove a saved class


to do:
    schedule algorithm
    display table format of current schedule from the algorithm with stuff like credits, time, section, MoWeFr, etc

    add your own course or timeslot (like lunch break) on SavedCourses page
    remove class from search if no sections populate for the course (when searching for a specific campus)
    add semester attribute functionality (i.e. spring 2026 unchecked should show no courses)
    only include A-Z in search + sort by abbreviation in search

    react-error-boundary for error handling

future:
    update database with current/future semester data
    hosting site for server and website

optionally update SearchForm attribute button for better UX/UI
optionally update title page with husky ascii art
optionally add Rate my professor ratings: https://github.com/tisuela/ratemyprof-api/tree/master

docker/kubernetes application:
    https://www.youtube.com/watch?v=a1M_thDTqmU
    https://www.youtube.com/watch?v=DQdB7wFEygo


other project ideas:
    music visualization / opengl blackhole visualization
    Anime recommendation site for scraping your MAL list and recommending similar anime
    Spotify global key map, include mapping for specific playlists and maybe an additional song reccomender (using electron?)



schedule algorithm:
    algo itself
    test cases
    how do we handle conflicting times that should go in the same cell?
    memoization?
    scheduling algorithm should not run every render

*/