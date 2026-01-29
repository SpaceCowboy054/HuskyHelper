import React, {useRef, useEffect, useState} from 'react'
import {scheduleCourses} from "../utils/schedulingAlgorithm.js";

export default function Schedules(){
    const [startTime, setStartTime] = useState(8) // 8am, stored in 24hr time
    const [endTime, setEndTime] = useState(20)    // 8pm, stored in 24hr time
    const [rowCount, setRowCount] = useState(12)  // 8am-8pm = 12hrs
    const [scheduleWeek, setScheduleWeek] = useState(scheduleCourses(JSON.parse(localStorage.getItem("schedule"))));
    
    let mondayCourses = new Map([
        [11.25, {"title":"CSE 2050","span":"2", "description":"This is a sample description for CSE 2050. It covers various topics in computer science including algorithms, data structures, and software engineering principles."}],
        [11.5, 11.25]])
    let wednesdayCourses = new Map([
        [11.5, {"title":"MATH 2410","span":"4", "description":"This is a sample description for MATH 2410."}],
        [11.75, 11.5],[12, 11.5],[12.25, 11.5]
    ])
    let temp = new Map()
    let allCourses = [mondayCourses, temp, wednesdayCourses, temp, temp, temp, temp]

    // update rowCount
    useEffect(() =>{
        endTime - startTime <= 0 ? setRowCount(0) : setRowCount(endTime-startTime);
        // console.log("start: " + startTime + " end: " + endTime);
    }, [startTime, endTime])

    useEffect(() => {
        console.log("Schedule Week Updated:");
        console.log(scheduleWeek)
    }, [scheduleWeek])

    function setTime(time, isStartTime){
        // check if AM or PM then convert to 24hr time
        try{
            if(time?.toLowerCase().indexOf("a") != -1){
                if(isStartTime){setStartTime(parseInt(time.match(/\d{1,2}/)[0]))}
                else{setEndTime(parseInt(time.match(/\d{1,2}/)[0]))}
            }
            else if(time?.toLowerCase().indexOf("p") != -1){
                time = parseInt(time.match(/\d{1,2}/)[0]);
                if(time != 12){time += 12;}                
                if(isStartTime){setStartTime(time)}
                else{setEndTime(time)}
            }
        }catch(error){console.log(error)}
    }

    function timeTo12Hr(time){
        let res = ""
        if((time) % 12 == 0){res += "12"}
        else if(time >= 12){res += time - 12}
        else{res += time}
        res = res + ":00 ";
        
        (time) >= 12 ? res+="PM" : res+="AM";
        return res;
    }

    function courseElement(courseData, span) {
    return(    <div
            className="bg-gray-500 text-white border-gray-500 border-2 flex items-center justify-center"
            style={{ gridRow: `span ${span}` }}>
            <div className="p-1 w-full text-center">
                {courseData.title}
                {courseData.description}
            </div>
        </div>)
    }

    function buildCells(){
        let cells = [];
        // divide into hour segments
        for(let i = 0; i < rowCount; i++){
            // 8 columns * 4 rows (15 mins each) = 32 cells
            let curTime = startTime + i;
            for(let j = 0; j < 32; j++){
                let newCell;
                let courseData = allCourses[j % 8 - 1]?.get(curTime);

                // first column is either a time or empty
                if(j % 8 == 0){
                    if(j == 0){newCell = <div className="text-white text-right pr-4 min-h-6 -mt-2">{timeTo12Hr(startTime + i)}</div>}
                    else{newCell = <div></div>; curTime += .25;}
                }
                else if(courseData){
                    // if the courseData is in the schedule and is a number it means we skip this cell, but we have to check if the anchor cell is not rendered yet because of the user defined start time being past the course time
                    if(typeof(courseData) === "number"){
                        // courseData is the time of the anchor cell and we don't need to render the anchor cell if it's after the user defined start time
                        if(courseData >= startTime || courseData == -1){continue;}
                        
                        // since we are rendering the anchor cell, we need to tell the other span cells to not render the anchor cell
                        // the item past the end of the loop with either be another anchor cell or out of bounds
                        let tempCourseData = allCourses[j % 8 - 1]?.get(courseData);
                        for(let k = curTime + .25; allCourses[j % 8 - 1]?.get(k) != courseData || allCourses[j % 8 - 1]?.get(k) != undefined; k += .25){
                            // console.log('k value: ' + k);
                            // console.log(allCourses[j % 8 - 1]?.get(k));
                            // console.log(courseData);
                            // if(k >= 15){break;}
                            allCourses[j % 8 - 1]?.set(k, -1);
                        }

                        // courseData = allCourses[j % 8 - 1]?.get(courseData);
                        courseData = tempCourseData;
                        console.log('courseData after reassignment: ' + courseData);
                    }                    
                    // add span logic to prevent overflow from grid (caused by user defined end time)
                    let span = courseData.span;
                    if (curTime + span*.25 >= endTime) {
                        // console.log('adjusting span, endtime: ' + endTime + " courseStartTime: " + curTime);
                        span = (endTime - curTime)*4;} 
                    newCell = courseElement(courseData, span);
                }
                else{
                    // newCell = <div className= {`bg-white text-black min-h-6 border-gray-500 border-r-2` + cellBorderCSS}>{curTime}</div>
                    newCell = <div className= {`bg-white text-black border-gray-500 border-r-2` + (j % 16 < 8 ? " border-t-2" : "")}>{curTime}</div>
                }
                cells.push(newCell)
            }
        }
        return cells;
    }

    return (
    <>
        <form className = "flex flex-col"
        onSubmit = {(e) =>{
                e.preventDefault();
                const formData = new FormData(e.target);
                setTime(formData.get("startTime"), true);
                setTime(formData.get("endTime"), false);
            }}>
            <div className = "flex justify-center">
                <button className = "border-black bg-white border-2 rounded-full pl-2 pr-2 m-6">Previous Schedule</button>
                <button className = "border-black bg-white border-2 rounded-full pl-2 pr-2 m-6">Next Schedule</button>   
            </div>
            <div className = "flex justify-center items-center">
                <p className = "text-white">Start Time</p>
                <input name = "startTime" autocomplete="off" placeholder = "8:00AM" className = "w-20 m-2 pl-1"></input>
                <p className = "text-white">End Time</p>
                <input name = "endTime" autocomplete="off" placeholder = "8:00PM" className = "w-20 m-2 pl-1"></input>
            </div>
            <div className = "flex justify-center">
                <input type = "checkbox"></input><p className = "text-white p-2">Show Instructor</p>
                <input type = "checkbox"></input><p className = "text-white p-2">Show Course Title</p>
            </div>
        </form>
        
        {/* the grid consists on a row for the days of the week and a column for the times, the schedule of 30 minute blocks is the rest of the grid */}
        <div className = "flex justify-center">
            {/* <div className = {`grid grid-cols-8 grid-rows-[${rowCount*4 + 1}] w-1/2`}> */}
            <div className = {`grid grid-cols-8 w-1/2`}
            style={{ 
                gridTemplateRows: `auto repeat(${rowCount * 4 + 1}, minmax(.8rem, auto))`,
                gridAutoFlow: 'row dense'
            }}
            >
                 {/* first row for days of the week */}
                <div className = "text-white text-center"></div>
                <div className = "text-white text-center">Monday</div>
                <div className = "text-white text-center">Tuesday</div>
                <div className = "text-white text-center">Wednesday</div>
                <div className = "text-white text-center">Thursday</div>
                <div className = "text-white text-center">Friday</div>
                <div className = "text-white text-center">Saturday</div>
                <div className = "text-white text-center">Sunday</div>
                {buildCells()}
                {/* {console.log(performance.memory.usedJSHeapSize / 1024 / 1024, "MB used")} */}
            </div> 
        </div>
        
    </>
    )
}