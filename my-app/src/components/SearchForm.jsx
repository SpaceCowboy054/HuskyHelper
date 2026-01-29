import React, {useRef, useEffect, useState} from 'react'
import { IoIosSearch } from "react-icons/io";
import { FaAsterisk } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import "./hideScrollbar.css";

async function getSubjectsMap(){
    try {
        const res = await fetch("http://localhost:5000/");
        const data = await res.json();
        let map = new Map();

        console.log("Data:", data);
        data.forEach((value, index) =>{
            // console.log("name: " + value.name + " abbr: " + value.abbreviation);
            map.set(value.name, value.abbreviation);
        })
        return map;
    } catch (err) {
        console.error("Error:", err);
        return {"name":"could not find subject, react error", "abbreviation" : "error"};
    }
}

function SubjectField(){
    const [subjectMap, setSubjectMap] = useState(new Map());
    const [listItems, setListItems] = useState(["subjects not found"]);
    useEffect(() => {
        getSubjectsMap().then((map) => {setSubjectMap(map);});
    },[]);

    useEffect(() =>{
        if(subjectMap === undefined) return;
        let tempListItems = new Array();
        subjectMap.forEach((abbr, name) => {
            // console.log("added: " + name);
            tempListItems.push(name)})
        setListItems(tempListItems);
    }, [subjectMap])
    const [focusedIndex, setFocusedIndex] = useState(0);
    const resultContainer = useRef(null);
    const [showResults, setShowResults] = useState(false);
    const [inputIsFocused, setInputIsFocused] = useState(false);

    // filter items based on user query
    const [query, setQuery] = useState("");
    const filteredItems = listItems.filter(item =>{
        // console.log("abbr: " + subjectMap.get(item));
        return item.toLowerCase().startsWith(query.toLowerCase()) ||
        subjectMap.get(item)?.toLowerCase().startsWith(query.toLowerCase());});

    function handleKeyDown(e){
        let nextIndexCount = 0;

        if(e.key === "ArrowDown"){
            nextIndexCount = (focusedIndex + 1) % filteredItems.length;
        }

        if(e.key === "ArrowUp"){
            nextIndexCount = (focusedIndex + filteredItems.length - 1) % filteredItems.length;
        }

        if(e.key === "Enter"){
            if(inputIsFocused){
                e.preventDefault();
                // setQuery(filteredItems[focusedIndex]) // to set query to user input instead of abbreviations
                setQuery(subjectMap.get(filteredItems[focusedIndex]))
                setShowResults(false);
                setInputIsFocused(false);
            }
        }

        setFocusedIndex(nextIndexCount)
    }

    useEffect(() => {
        if (!resultContainer.current) return;

        resultContainer.current.scrollIntoView({
            block: "center",
        });
    }, [focusedIndex]);

    useEffect(() => {
        if(inputIsFocused && filteredItems.length > 0 && !showResults) setShowResults(true);
        if(filteredItems.length <= 0 || (!inputIsFocused && showResults)) setShowResults(false);
    }, [filteredItems]);

    return (
        <div tabIndex = {1} className = "relative focus:outline-none">
            <input 
            type = "text"
            name = "subject"
            placeholder = "Subject"
            autoComplete= "off"
            className = "w-[150px] border-2 border-black px-5 mx-2 rounded-full focus:border-grey-700 outline-none text-opacity-0 placeholder-grey-500"
            onChange = {(e) => {setQuery(e.target.value); setInputIsFocused(true);}}
            onFocus = {() => setInputIsFocused(true)}
            onBlur = {() => setInputIsFocused(false)}
            value = {query}
            onKeyDown = {handleKeyDown}
            ></input>
            { showResults &&
                <ul className = "absolute left-4 w-[400px] overflow-y-auto max-h-48 top-full bg-white border border-gray-300 rounded-md mt-1 z-10 scrollbar-hide">
                    {filteredItems.map((item, index) => (<li
                    key = {index}
                    ref = {index === focusedIndex ? resultContainer : null}
                    style = {{backgroundColor: index === focusedIndex ? "rgba(0,0,0,0.1)" : ""}}
                    className = "cursor-pointer hover:bg-black hover:bg-opacity-10"
                    onMouseDown = {() => {
                        setQuery(subjectMap.get(item));
                        setShowResults(false);
                        setInputIsFocused(false);
                    }}
                    >{subjectMap.get(item)+ " - " + item}</li>))}
                </ul>
            }
        </div>
    )
}

function AttributesButton(){
    const dialogRef = useRef(null);
    const openDialog = () =>{
        dialogRef.current.showModal();
    }
    const closeDialog = () => {
        dialogRef.current.close();
    }

    return (
        <>
            <button type = "button" onClick = {openDialog}>
                    <FaAsterisk className = "size-6 m-2 border-2 rounded-full border-black bg-white hover:bg-gray-400"/>
            </button>
            <dialog ref={dialogRef} className = "h-[250px] w-[800px] bg-gradient-to-t from-blue-700 to-neutral-800">
                <ul className = "flex flex-col justify-evenly pl-8 h-[250px] w-[800px]">
                    <li className = "flex justify-center text-white"><h1>Course Search Attributes</h1></li>
                    <li className = "flex flex-row justify-evenly text-white">
                        Campus: 
                        <label><input type="checkbox" name = "storrs" defaultChecked/>Storrs</label>
                        <label><input type="checkbox" name = "waterbury" defaultChecked/>Waterbury</label>
                        <label><input type="checkbox" name = "hartford" defaultChecked/>Hartford</label>
                        <label><input type="checkbox" name = "avery point" defaultChecked/>Avery Point</label>
                        <label><input type="checkbox" name = "stamford" defaultChecked/>Stamford</label>
                    </li>

                    <li className = "flex flex-row justify-evenly text-white">
                        <label><input type="checkbox" defaultChecked/>Spring 2026</label>
                    </li>

                    <li className = "flex flex-row justify-evenly text-white">
                        <label><input type="checkbox" name = "q" />Quantatative</label>
                        <label><input type="checkbox" name = "w" />Writing</label>
                        <label><input type="checkbox" name = "e" />Environmental</label>
                    </li>

                    <li className = "flex flex-row justify-evenly text-white">
                        Content Areas:
                        <label><input type="checkbox" name = "ca1"/>CA 1</label>
                        <label><input type="checkbox" name = "ca2"/>CA 2</label>
                        <label><input type="checkbox" name = "ca3"/>CA 3</label>
                        <label><input type="checkbox" name = "ca4"/>CA 4</label>
                        <label><input type="checkbox" name = "ca4int"/>CA 4 International</label>
                    </li>

                    <li className = "flex flex-row justify-evenly text-white">
                        Topics of Inquiry:
                        <label><input type="checkbox" name = "toi1"/>TOI 1</label>
                        <label><input type="checkbox" name = "toi2"/>TOI 2</label>
                        <label><input type="checkbox" name = "toi3"/>TOI 3</label>
                        <label><input type="checkbox" name = "toi4"/>TOI 4</label>
                        <label><input type="checkbox" name = "toi5"/>TOI 5</label>
                        <label><input type="checkbox" name = "toi6"/>TOI 6</label>
                    </li>

                    <li className = "flex justify-center"><button type = "button" onClick = {closeDialog} className = "rounded-3xl border-white bg-white text-black pt-0.5 pb-0.5 pl-2 pr-2 hover:bg-gray-400">Close</button></li>
                </ul>
            </dialog>
        </>
    )
}

export default function SearchForm(props){

    const navigate = useNavigate();

    const submitForm = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        console.log(formData.get("storrs"));
        console.log(" ");
        fetch("http://localhost:5000/")
            .then(res => console.log(res.json()))
            .catch(err => console.log(err))
        // format the data in our url
        // format is subject, searchtext, 5 campuses, QWE, 5 content areas, 6 topics of inquiry
        let urlData = `?subject=${formData.get("subject")}&searchtext=${formData.get("searchtext")}&attrs=`;
        let attrs = ["storrs", "waterbury", "hartford", "avery point", "stamford","q","w","e","ca1","ca2","ca3","ca4","ca4int","toi1","toi2","toi3","toi4","toi5","toi6"]
        attrs.forEach((key, value, attrs) =>{
            urlData += (formData.get(key) == "on") | 0;
        })
        navigate(`/search${urlData}`);
    };

    return (
        <form className = {`flex items-center justify-center ${props.className}`}
            onSubmit = {submitForm}>
            <SubjectField/>
            <input
                type = "text"
                autoComplete="off"
                placeholder = "Search for a course"
                name = "searchtext"
                className = "w-[250px] border-2 border-black rounded-full px-4"
            ></input>
            <AttributesButton/>
            <button>
                <IoIosSearch className = "size-6 border-2 rounded-full border-black bg-white hover:bg-gray-400"/>
            </button>
        </form>
    )
}