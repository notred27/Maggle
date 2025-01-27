import { useState } from "react";
import SearchBarEntry from "./SearchBarEntry";


export default function SearchBar({ searchRef, items }) {
    const [filter, setFilter] = useState("");



    function updateFilter() {
        setFilter(searchRef.current.value);
    }


    function setText(val) {
        searchRef.current.value = val;
        setFilter(val);


    }

    let rows = []

    items.forEach((i) => {
        if (i.toLowerCase().indexOf(filter.toLowerCase()) === -1) {
            return;
        }

        if(rows.length < 10) {
            rows.push(<SearchBarEntry value={i} setText={setText} />)

        }
    })


    return (
        <div style={{position:"relative"}}>
        <input className="searchInput" ref={searchRef} onChange={updateFilter} placeholder="Search for the song!" />
        
        <div style={{position:"absolute", backgroundColor:"white", width: "30vw", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            

            {filter !== "" && searchRef.current === document.activeElement && rows}


        </div>
        </div>
    )
}