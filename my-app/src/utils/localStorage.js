// This stores our saved courses/section data
// savedCourses is an array of [course, [section1, section2, ...]] pairs

export function addSavedCourse(key, value){
    try{
        if (!localStorage.getItem("savedCourses")) {localStorage.setItem("savedCourses", JSON.stringify([]));}
        let arr = JSON.parse(localStorage.getItem("savedCourses") || "[]");
        arr.push([key, value])
        localStorage.setItem("savedCourses", JSON.stringify(arr))

    }catch(error){console.log(error)}
}

export function removeSavedCourse(key){
    // remove saved course based on course_id
    try{
        if (!localStorage.getItem("savedCourses")){return;}
        let arr = JSON.parse(localStorage.getItem("savedCourses") || "[]");
        for(let i = 0; i < arr.length; i++){
            if(arr[i][0].course_id == key){
                arr.splice(i, 1)
                i -= 1;
            }
        }
        localStorage.setItem("savedCourses", JSON.stringify(arr))

    }catch(error){console.log(error)}
}

export function isSavedCourse(key){
    try{
        if (!localStorage.getItem("savedCourses")){return false;}
        let arr = JSON.parse(localStorage.getItem("savedCourses") || "[]");
        for(let i = 0; i < arr.length; i++){
            if(arr[i][0].course_id == key){return true;}
        }
        return false;

    }catch(error){console.log(error); return false;}
}

// Same format as saved courses
// array of [course, [section1, section2, ...]] pairs

export function addScheduleCourse(courseData, sectionData){
    try{
        if (!localStorage.getItem("schedule")){localStorage.setItem("schedule", JSON.stringify([]));}
        let arr = JSON.parse(localStorage.getItem("schedule") || "[]");
        let courseIdx = -1;
        for(let i = 0; i < arr.length; i++){
            if(arr[i][0].course_id == courseData.course_id){courseIdx = i}
        }
        if(courseIdx == -1){arr.push([courseData, [sectionData]])}
        else{arr[courseIdx][1].push(sectionData)}
        localStorage.setItem("schedule", JSON.stringify(arr))
    }catch(error){console.log(error)}
}

export function removeScheduleSection(courseID, sectionNumber){
    try{
        let arr = JSON.parse(localStorage.getItem("schedule"))
        if(!arr){return;}
        for(let i = 0; i < arr.length; i++){
            if(arr[i][0].course_id == courseID){
                for(let j = 0; j < arr[i][1].length; j++){
                    if(arr[i][1][j].section_number == sectionNumber){
                        arr[i][1].splice(j, 1)
                        j -= 1;
                    }
                }
                // remove course if no sections are left
                if(arr[i][1].length == 0){
                    arr.splice(i, 1);
                }
            }
        }
        localStorage.setItem("schedule", JSON.stringify(arr))
    }catch(error){console.log(error)}
}

export function sectionInSchedule(courseID, sectionNumber){
    try{
        let arr = JSON.parse(localStorage.getItem("schedule"))
        if(!arr){return;}
        for(let i = 0; i < arr.length; i++){
            if(arr[i][0].course_id == courseID){
                for(let j = 0; j < arr[i][1].length; j++){
                    if(arr[i][1][j].section_number == sectionNumber){
                        return true;
                    }
                }
            }
        }
        return false;
    }catch(error){console.log(error); return false;}
}

export function allSectionsInSchedule(courseID, sectionNumbers){
    try{
        if(sectionNumbers.length == 0) return false;
        let arr = JSON.parse(localStorage.getItem("schedule"))
        if(!arr){return false;}
        for(let i = 0; i < arr.length; i++){
            if(arr[i][0].course_id == courseID){
                for(let j = 0; j < arr[i][1].length; j++){
                    if(!sectionNumbers.includes(arr[i][1][j].section_number)){
                        return false;
                    }
                }
            }
        }
        return true;
    }catch(error){console.log(error); return false;}
}

export function returnSectionsInSchedule(courseID){
    try{
        let arr = JSON.parse(localStorage.getItem("schedule"))
        let res = [];
        if(!arr){return;}
        for(let i = 0; i < arr.length; i++){
            if(arr[i][0].course_id == courseID){
                for(let j = 0; j < arr[i][1].length; j++){
                    res.push(arr[i][1][j]);
                }
            }
        }
        return res;
    }catch(error){console.log(error);}
}

export function courseAndSectionsInSchedule(){
    try{
        let arr = JSON.parse(localStorage.getItem("schedule"))
        if(!arr || arr.length==0){return "Please select sections from saved courses to create a schedule";}
        let res = "Selected Courses: </br>";
        for(let i = 0; i < arr.length; i++){
            let numSections = arr[i][1].length;
            let s = numSections >= 2 ? "s" : "";
            res += arr[i][0].abbreviation + " " + arr[i][0].catalog_number + " with " + numSections + " section" + s + "</br>";
        }
        return res;
    }catch(error){console.log(error)}
}