import { useState, useRef } from "react";
import SearchBarEntry from "./SearchBarEntry";


export default function SearchBar({ searchRef, items }) {
    const [filter, setFilter] = useState("");

    const menuRef = useRef(null)

    const closeDropdown = (e)=>{
        if(filter !== "" && !menuRef.current?.contains(e.target)){
          setFilter("")
        }
    }

    document.addEventListener('mousedown',closeDropdown)



    function updateFilter() {
        setFilter(searchRef.current.value);
    }


    function setText(val) {
        searchRef.current.value = val;
        setFilter(val);


    }

    let rows = []

    items.forEach((i, idx) => {
        if (i.toLowerCase().indexOf(filter.toLowerCase()) === -1) {
            return;
        }

        if (rows.length < 10) {
            rows.push(<SearchBarEntry key={`songSearchItem${idx}`} value={i} setText={setText} />)

        }
    })


    return (
        <div ref={menuRef} style={{ position: "relative" }}>

            <div style={{ position: "absolute", left:"10px", bottom: "30px", backgroundColor: "white", width: "40vw", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderRadius:"5px" }}>
                {filter !== "" && searchRef.current === document.activeElement && rows}
            </div>


            <input className="searchInput" ref={searchRef} onChange={updateFilter} placeholder="Search for the song!" />


        </div>
    )
}