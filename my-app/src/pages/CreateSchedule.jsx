import TableRow from "../components/TableRow";
import {courseAndSectionsInSchedule} from "../utils/localStorage";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';
import React, {useEffect, useState, useRef} from 'react';
import { useNavigate } from "react-router-dom";

function SavedCoursesTable(){
    let savedCourses = JSON.parse(localStorage.getItem("savedCourses"))
    if(!savedCourses || savedCourses.length == 0){return <p className="text-white">No saved courses - Please select sections from saved courses to create a schedule</p>}
    
    return savedCourses.map((item, index) => 
        <TableRow jsondata = {item} renderScheduleButton = {true} ></TableRow>
    )
}



export default function CreateSchedule(){
    const [createScheduleButtonHovered, setCreateScheduleButtonHovered] = useState(false);
    const [tooltipContent, setTooltipContent] = useState("")
    const navigate = useNavigate();
    
    useEffect(() =>{
        setTooltipContent(courseAndSectionsInSchedule())
    },[createScheduleButtonHovered])

    return (<div className = "flex items-center justify-center flex-col">
            <p className = "text-white m-4 text-3xl text-bold">Saved Courses</p>
            <button className = "border-black bg-white border-2 rounded-full pl-2 pr-2"
            onMouseEnter={() => setCreateScheduleButtonHovered(true)}
            onMouseLeave={() => setCreateScheduleButtonHovered(false)}
            data-tooltip-id="create-schedule-button-tooltip"
            data-tooltip-html = {tooltipContent}
            onClick = {() => navigate('/schedules')}
            >Create Schedule</button>
            <Tooltip id="create-schedule-button-tooltip"/>
            <TableRow headerRow = "true"></TableRow>
            {React.useMemo(() => <SavedCoursesTable></SavedCoursesTable>, [])}
            </div>)
}