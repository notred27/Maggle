import { useState, useRef } from "react";


export default function SearchBar({ searchRef, items }) {
    const [filter, setFilter] = useState("");
    const menuRef = useRef(null);

    /**
     * Close the popup menu if another HTML element is clicked.
     * @param {*} e HTML event
     */
    const closeDropdown = (e) => {
        if (filter !== "" && !menuRef.current?.contains(e.target)) {
            setFilter("");
        }
    }
    document.addEventListener('mousedown', closeDropdown);



    /**
     * If a search item is clicked, set the searchbar's value to it.
     * @param {*} val A string of the format "[song title] - [artist]"
     */
    function setText(val) {
        searchRef.current.value = val;
        setFilter(val);
    }


    // Find the first 10 items that match the user's current search and display them
    const rows = items
    .filter(i => i.toLowerCase().includes(filter.toLowerCase())) // Match filter
    .slice(0, 10) // For first 10 items
    .map((i, idx) => (  //Create display objects
      <div key={`songSearchItem${idx}`} className="searchBarItem" onClick={() => setText(i)}>{i}</div>
    ));


    return (
        <div id = "searchBarContainer" ref={menuRef}>

            <div className="songSearchItem">
                {filter !== "" && searchRef.current === document.activeElement && rows}
            </div>

            <input className="searchInput" ref={searchRef} onChange={() => setFilter(searchRef.current.value)} placeholder="Search for the song!" />
        </div>
    )
}