

export default function SearchBarEntry({value, setText}) {

    return (
        <div className="searchBarItem" onClick={() => setText(value)}>
        {value}
        </div>
    )

}