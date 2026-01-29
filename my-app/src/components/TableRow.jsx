import React, {useEffect, useState, useRef} from 'react';
import { MdOutlineFileDownloadDone } from "react-icons/md";
import 'react-tooltip/dist/react-tooltip.css';
import { Tooltip } from 'react-tooltip';
import { RxCross1 } from "react-icons/rx";
import { HiPlusSm } from "react-icons/hi";
import { TiMinus } from "react-icons/ti";

import { addSavedCourse, removeSavedCourse, isSavedCourse, addScheduleCourse, removeScheduleSection, sectionInSchedule, allSectionsInSchedule, returnSectionsInSchedule} from '../utils/localStorage';


function contentArea_topicsOfInquiryText(props){
    let outputText = ""
    for(let i = 1; i <= 4; i++){
        if(props[`ca${i}`] == true){
            outputText += `CA${i} `;
        }
    }
    if(props[`ca4int`] == true){outputText += `CA4INT `}

    for(let i = 1; i <= 6; i++){
    if(props[`toi${i}`] == true){
        outputText += `TOI${i} `}
    }
    return outputText;
}

function EnrollmentRequirements(props){
    let data = props.data
    if(data === undefined || data === null || data.toLowerCase().startsWith("content area") || data.toLowerCase().startsWith("skill codes")){return;}
    return <p>{data}</p>
}

function SectionRow(props){
    const courseData = props.courseData;
    const sectionData = props.sectionData;
    const courseID = courseData ? courseData.course_id : undefined;
    const sectionNumber = sectionData ? sectionData.section_number : undefined;
    const headerScheduleButtonRef = useRef(null);

    // header row == props.headerButtonclicked
    // section row == props.headerButtonClicked || sectionInSchedule(courseID, sectionNumber) 
    const [scheduleButtonClicked, setScheduleButtonClicked] = useState(
        props.isHeaderRow ? props.headerButtonClicked : 
        (courseID && sectionNumber && sectionInSchedule(courseID, sectionNumber)));

    useEffect(()=>{
        if(props.headerButtonClicked){setScheduleButtonClicked(true)}
        // first logic statement ensures that all section buttons go to false when the headerButton is clicked, not just on re-render
        // second logic statement ensures that when the last section button is clicked 
        else if(props.headerButtonClickedBy == "header" || props.headerButtonClickedBy == "lastScheduleSectionButton"){setScheduleButtonClicked(false)} 
    }, [props.headerButtonClicked, props.headerButtonClickedBy])

    let meeting_time;
    let meeting_days;
    if(sectionData.meeting_time){
        let lastIdx = sectionData.meeting_time.lastIndexOf('/')
        meeting_time = sectionData.meeting_time.slice(0, lastIdx - 1);
        meeting_days = sectionData.meeting_time.slice(lastIdx + 1);
    }

    console.log("render: scheduleButtonClicked:", scheduleButtonClicked, "headerButtonClicked:", props.headerButtonClicked);
    
    return (
    <div className = {`border-white border-2 border-opacity-60 flex h-auto text-white w-full items-center text-center m-2 rounded-lg`}>
        <p className = "w-[5%]">{sectionData.section_number}</p>
        <p className = "w-[15%]">{sectionData.instructor.replaceAll("(PI)","").replaceAll("(SI)", "").replaceAll("(TC)","").replaceAll(",", "+")}</p>
        <p className = "w-[10%]">{sectionData.campus}</p>
        <div className = "w-[15%] flex flex-col">
            <p>{meeting_time}</p>
            <p>{meeting_days}</p>
        </div>
        <p className = "w-[10%]">{sectionData.instruction_mode}</p>
        <p className = "w-[10%]">{sectionData.required_additional_sections}</p>
        <p className = "w-[15%]">{sectionData.current_enrollment}/{sectionData.max_enrollment}</p>
        <p className = "w-[15%]">{sectionData.reserved_seats_info}</p>
        {props.renderScheduleButton && (
            <div className = "w-[5%] flex items-center justify-center" name = {props.isHeaderRow ? "headerScheduleButton" : "sectionScheduleButton"}>
                <button className = {`flex items-center justify-center size-6 border-2 rounded-full border-black hover:bg-gray-400 ${!scheduleButtonClicked ? "bg-white text-black" : "bg-black text-white"}`}
                data-tooltip-id="schedule-tooltip" 
                data-tooltip-content={
                    props.isHeaderRow ? (!scheduleButtonClicked ? "Add All Sections to Schedule": "Remove All Sections from Schedule") :
                    !scheduleButtonClicked ? "Add to Schedule" : "Remove from Schedule"}
                ref = {headerScheduleButtonRef}
                onClick = {(e) =>{
                    setScheduleButtonClicked(!scheduleButtonClicked);
                    if(props.isHeaderRow){
                        for(let i = 0; i < props.sections.length; i++){
                            !props.headerButtonClicked ? addScheduleCourse(courseData, props.sections[i]) : removeScheduleSection(courseID, props.sections[i].section_number);
                        }
                        props.setHeaderButtonClicked(!props.headerButtonClicked);
                        props.setHeaderButtonClickedBy("header");
                    }
                    else {
                        !scheduleButtonClicked ? addScheduleCourse(courseData, sectionData) : removeScheduleSection(courseID, sectionNumber)
                        
                        // add functionality to make headerScheduleButton swap when all section buttons are clicked or all section buttons are not clicked
                        // get number of sections in the course and compare them to the number in the schedule
                        let max_sections = props.numOfSections;
                        let num_sections_schedule = returnSectionsInSchedule(courseID).length;
                        console.log("cur sections: " + max_sections)
                        console.log("schedule sections: " + num_sections_schedule)
                        if(max_sections == num_sections_schedule){
                            props.setHeaderButtonClicked(true)
                            props.setHeaderButtonClickedBy("button");
                        }
                        else if(num_sections_schedule == max_sections - 1){
                            props.setHeaderButtonClicked(false)
                            props.setHeaderButtonClickedBy("button");
                        }
                        else if(num_sections_schedule == 0){
                            console.log("set to false")
                            props.setHeaderButtonClicked(false) 
                            props.setHeaderButtonClickedBy("lastScheduleSectionButton");
                        }
                    }
                    }}>
                {!scheduleButtonClicked ? <HiPlusSm/> : <TiMinus/>}
                </button>
                <Tooltip id = "schedule-tooltip" delayHide={5} delayShow={5}/>
                </div>)}
    </div>)
}

export default function TableRow(props){
    if(props.headerRow == "true"){
        {return <div className = {`border-white border-2 border-opacity-60 flex h-auto text-white w-1/2 justify-items items-center m-2 rounded-lg`}>
            <p className = "w-1/2 pl-2 mr-2">Course Information</p>
            <p className = "w-1/4 m-2">Term</p>
            <p className = "w-1/4 m-2">Content Areas/Topics of Inquiry</p>
        </div>}
    }

    const course = props.jsondata[0]
    const sections = props.jsondata[1]
    const [rowExpanded, setRowExpanded] = useState(false);
    const saveButtonRef = useRef(null);

    let sectionNumbers = returnSectionsInSchedule(course.course_id)?.map(section => section.section_number)
    const [headerButtonClicked, setHeaderButtonClicked] = useState(allSectionsInSchedule(course.course_id, sectionNumbers));
    const [headerButtonClickedBy, setHeaderButtonClickedBy] = useState("");

    const [saveButtonClicked, setSaveButtonClicked] = useState(false);
    useEffect(() =>{
        setSaveButtonClicked(isSavedCourse(course.course_id))
    }, [])

    try{
        if(props.jsondata !== undefined) 
            {return <div className = "flex flex-col justify-items items-center w-1/2">
                <div className = {`border-white border-2 border-opacity-60 flex h-auto text-white w-full justify-items items-center m-2 rounded-lg hover:bg-gray-700 ${rowExpanded ? "bg-gray-700" : ""}`} 
                onClick = {(e) => {
                    if(saveButtonRef.current && !saveButtonRef.current.contains(e.target))setRowExpanded(!rowExpanded)}}>
                    <p className = "w-1/2 pl-2 mr-2">{course.abbreviation} {course.catalog_number} - {course.course_name}</p>
                    <p className = "w-1/4 m-2">{course.term}</p>
                    <p className = "w-1/4 m-2 pl-8">{contentArea_topicsOfInquiryText(course)}</p>
                    <button
                    id = "button"
                    className = {`size-6 border-2 rounded-full border-black hover:bg-gray-400 mr-3 flex justify-center items-center ${!saveButtonClicked ? "bg-white text-black" : "bg-black text-white"}`}
                    data-tooltip-id="saved-class-tooltip" data-tooltip-content={!saveButtonClicked ? "Add to Saved Classes" : "Remove from Saved Classes"}
                    onClick = {(e) =>{
                            if (saveButtonRef.current && saveButtonRef.current.contains(e.target)){
                                setSaveButtonClicked(!saveButtonClicked);
                                if(!saveButtonClicked) {addSavedCourse(course, sections);}
                                else {removeSavedCourse(course.course_id);}
                            }}}
                    ref = {saveButtonRef}>
                    {!saveButtonClicked ? <MdOutlineFileDownloadDone/>:<RxCross1/>}
                    </button>
                    <Tooltip id = "saved-class-tooltip" delayHide={5} delayShow={5}/>
                </div>
                {rowExpanded && (
                <>
                    <div className = "max-h-56 min-w-[100%] border-white border-2 border-opacity-60 text-white rounded-lg p-2">
                        <p>{course.description}</p>
                        <EnrollmentRequirements data = {course.enrollment_requirements}></EnrollmentRequirements>
                    </div>
                    <div className = "flex flex-col justify-items items-center w-[95%]">
                    {/* This sectionRow is the header row */}
                        <SectionRow sectionData = {{"section_number":"Section Number", "instructor":"Instructor", "campus":"Campus", 
                            "meeting_time":"Meeting / Time", "instruction_mode":"Instruction Mode", "required_additional_sections":"Required Additional Sections",
                            "current_enrollment": "Current", "max_enrollment":"Max Enrollment", "reserved_seats_info": "Reserved Seats Info"}} 
                            courseData = {course}
                            sections = {sections}
                            isHeaderRow = {true}
                            renderScheduleButton = {props.renderScheduleButton}
                            headerButtonClicked = {headerButtonClicked}
                            setHeaderButtonClicked = {setHeaderButtonClicked}
                            headerButtonClickedBy = {headerButtonClickedBy} 
                            setHeaderButtonClickedBy = {setHeaderButtonClickedBy}
                            {...console.log("headerButtonClicked: " + headerButtonClicked)}
                            {...console.log("all sections: " + allSectionsInSchedule(course.course_id, sectionNumbers))}
                            />
                        {sections.map((item, index) => {
                            return <SectionRow courseData = {course} sectionData = {item} numOfSections = {sections.length} renderScheduleButton = {props.renderScheduleButton} headerButtonClicked = {headerButtonClicked}
                            setHeaderButtonClicked = {setHeaderButtonClicked} headerButtonClickedBy = {headerButtonClickedBy} setHeaderButtonClickedBy = {setHeaderButtonClickedBy}/>
                        })}
                    </div>
                </>
                )}
            </div>}
        return <p className = {props.className}>hello!</p>
    }catch(err){console.log(err)}
}