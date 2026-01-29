function quickSortBySectionCount(arr, l, r){
    if(l >= r){return;}

    let pivot = arr[r][1].length;
    let i = l - 1;
    for(let j = l; j < r; j++){
        if(arr[j][1].length <= pivot){
            i++;
            swap(arr, i, j);
        }
    }

    i++
    swap(arr, i, r);
    quickSortBySectionCount(arr, l, i-1)
    quickSortBySectionCount(arr, i+1, r)
}

function swap(arr, l, r){
    let temp = arr[r];
    arr[r] = arr[l];
    arr[l] = temp;
}

function get24HrTime(time){
    // check if AM or PM then convert to 24hr time
    try{
        if(time?.toLowerCase().indexOf("a") != -1){
            let colonIdx = time.indexOf(":");
            let hour = parseInt(time.slice(0, colonIdx))
            let minutes = parseInt(time.slice(colonIdx + 1, colonIdx + 3)) / 60;
            return (hour + minutes);
            
            // we need to account for minutes for am/pm right now it only gets the hours
        }
        else if(time?.toLowerCase().indexOf("p") != -1){
            let colonIdx = time.indexOf(":");
            let hour = parseInt(time.slice(0, colonIdx))
            let minutes = parseInt(time.slice(colonIdx + 1, colonIdx + 3)) / 60;
            if(hour != 12){hour += 12;}
            return (hour + minutes);
        }
    }catch(error){console.log(error)}
}

function processSectionTime(str){
    // returns a pair of startTime, endTime
    let arr = [];
    let idx = str.indexOf("-");
    arr.push(get24HrTime(str.slice(0, idx - 1)))
    arr.push(get24HrTime(str.slice(idx + 2, str.length)))
    return arr;
    
}

function processDaysOfTheWeek(str){
    // returns the array of days of the week the section occurs
    // 0 = monday, 6 = sunday
    let arr = [];
    str = str.toLowerCase()
    if(str.indexOf("mo") != -1){arr.push(0)}
    if(str.indexOf("tu") != -1){arr.push(1)}
    if(str.indexOf("we") != -1){arr.push(2)}
    if(str.indexOf("th") != -1){arr.push(3)}
    if(str.indexOf("fr") != -1){arr.push(4)}
    if(str.indexOf("sa") != -1){arr.push(5)}
    if(str.indexOf("su") != -1){arr.push(6)}
    return arr;
}

export function scheduleCourses(courseSectionsArray){
    // first we will sort the array by how constrained the sections are (the number of sections from least to most sections)
    quickSortBySectionCount(courseSectionsArray, 0, courseSectionsArray.length - 1)

    // preprocess our courseSectionsArray into [course, [section1, section2, ...]] so that section1 will also have the variable scheduleInfo (e.g scheduleInfo : ["monday", 14, 14.75])
    // scheduleInfo allows for the sections to have easily readable data to create the schedules
    for(let i = 0; i < courseSectionsArray.length; i++){
        for(let j = 0; j < courseSectionsArray[i][1].length; j++){
            let meeting_string = courseSectionsArray[i][1][j].meeting_time;
            let meetings = []
            // some can have meetings for multiple days at different times - this is separated by an & in our data
            let ampIdx = meeting_string.indexOf("&") 
            if(ampIdx != -1){
                meetings.push(meeting_string.slice(0, ampIdx - 1))
                meetings.push(meeting_string.slice(ampIdx + 1))
            }
            else{meetings.push(meeting_string)}

            let scheduleInfo = [];
            for(let meeting of meetings){
                let lastIdx = meeting.lastIndexOf('/')
                let meeting_time = meeting.slice(0, lastIdx - 1);
                let meeting_days = meeting.slice(lastIdx + 1);

                let timeArr = processSectionTime(meeting_time);
                let startTime = timeArr[0]
                let endTime = timeArr[1]
                let daysOfTheWeek = processDaysOfTheWeek(meeting_days);



                for(let day of daysOfTheWeek){
                    scheduleInfo.push([day, startTime, endTime]);
                }
            }
            console.log(meeting_string)
            console.log(scheduleInfo)
            courseSectionsArray[i][1][j].scheduleInfo = scheduleInfo;
        }
    }

    // our resultant schedule datas stucture: it is a map of all schedules of all the days of the week and their associated schedules eg. [mon, tues, wed, ...] with monday, tuesday, ... containing [int, json] or [int, int] 
    // int, json = [time, sectionJSON]
    // int, int = [time, timeOfSectionStart] acts like a pointer to the section data, this is needed to help assist with rendering, otherwise we would only have time, sectionJSON
    let schedule = Array.from({length:7}, () => new Map())

    // holds the start times of all courses for each day of the week
    let startTimes = Array.from({length:7}, () => [])
    
    // recursively find permutations of schedules
    for(let i = 0; i < courseSectionsArray[0][1].length; i++){
        scheduleCoursesRecursively(courseSectionsArray, startTimes, schedule, 0, i)
    }
}

let result = new Array();

function scheduleCoursesRecursively(courseSectionsArray, startTimes, schedule, curCourseIdx, curSectionIdx){
    // courseSectionsArray is [course, [section1, section2, ...]]
    let course = courseSectionsArray[curCourseIdx][0]
    let section = courseSectionsArray[curCourseIdx][1][curSectionIdx]

    // scheduleInfo of type [[day, startTime, endTime], [day2, startTime, endTim], ...]
    // let newSectionDays = section.scheduleInfo[0];
    // let newSectionStartTime = section.scheduleInfo[1];
    // let newSectionEndTime = section.scheduleInfo[2];

    for(let newSectionMeeting of section.scheduleInfo){
        let newSectionDay = newSectionMeeting[0];
        let newSectionStartTime = newSectionMeeting[1];
        let newSectionEndTime = newSectionMeeting[2];


        // if no sections in schedule, go to next day
        if(startTimes[newSectionDay].size == 0){continue;}
        
        // idxs of the already added courses of schedule for the day
        for(let startTime of startTimes[newSectionDay]){
            // if no sections in schedule, go to next day
            // if(schedule[newSectionDay].size == 0){continue;}
            let sectionInScheduleInfo = schedule[newSectionDay].get(startTime).scheduleInfo;
            let sectionInScheduleStartTime = sectionInScheduleInfo[1];
            let sectionInScheduleEndTime = sectionInScheduleInfo[2];

            // we check if new section start/end is inbetween any of the start/end times of our sections in our schedule already
            if(newSectionStartTime >= sectionInScheduleStartTime && newSectionStartTime <= sectionInScheduleEndTime){return;}
            if(newSectionEndTime >= sectionInScheduleStartTime && newSectionEndTime <= sectionInScheduleEndTime){return;}

        }
    }

    // if we get through the past for loop, that means that the new section doesn't have a time conflict
    // since no time conflict, we can add it to our schedule and recurse through the next sections
    
    // we need to add the 15 minute pointers in our schedule data structure for rendering 
    // our anchor startTime contains the section data
    section.course_title = course.course_title;
    for(let newSectionMeeting of section.scheduleInfo){
        let newSectionDay = newSectionMeeting[0];
        let newSectionStartTime = newSectionMeeting[1];
        let newSectionEndTime = newSectionMeeting[2];

        schedule[newSectionDay].set(newSectionStartTime, section)
        for(let i = newSectionStartTime + .25; i <= newSectionEndTime; i += .25){
            schedule[newSectionDay].set(i, newSectionStartTime)
        }
    }

    // base case - we have no more sections to add
    if(courseSectionsArray.length == curCourseIdx + 1){
        result.push(schedule);
        return;
    }

    // recurse down
    for(let i = 0; i < courseSectionsArray[curCourseIdx + 1][1].length; i++){
        scheduleCoursesRecursively(courseSectionsArray, startTimes, schedule, curCourseIdx + 1, i)
    }

    if(curCourseIdx == 0){
        console.log("RESULT ------------------------------------------------")
        console.log(result)
        
        // const items = [...new Map(result.flat().map(o => [JSON.stringify(o), o])).values()];
        let items = [];
        result.forEach((schedule, idx) => {
            let uniqueCourses = new Set()

            schedule.forEach((day, idx) =>{
                console.log(day)
                for(const value of day.values()){
                    if(value && typeof value === "object"){uniqueCourses.add(value);}
                }
            })
            items.push(uniqueCourses)
        })
        console.log(items)
        // console.log(typeof items[0][0].get(8))
        return result;}
}

