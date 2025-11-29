import { useRef, useState } from "react";
import useToken from "./hooks/useToken";
import { useNavigate } from 'react-router-dom';




export default function Guest() {
    const { setToken, getToken } = useToken();
    const [message, setMessage] = useState("");
    const nav = useNavigate();
    const inputRef = useRef(null);

    const [isDropped, setIsDropped] = useState(false);

    const hintRef = useRef(null)

    /**
     * Clear the token on logout
     */
    const logout = () => {
        setToken("", 0);
        nav("/login");
    }


    async function redirectToMain() {

        // Check that the profile exists
        const response = await fetch(`https://api.spotify.com/v1/users/${inputRef.current.value}`, {
            headers: {
                Authorization: 'Bearer ' + getToken()
            }
        });

        const data = await response;

        if (data.ok) {
            nav(`/${inputRef.current.value}`)
        } else {
            setMessage(`No user with Spotify id "${inputRef.current.value}" was found. Please ensure that the id you entered is correct.`)
        }
    }


    return (
        <div style={{display:"flex", flexDirection:"column", justifyContent:"space-between", height:"100%"}}>
            <div>
                <h2>Please enter your target profile:</h2>


                <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                    <input ref={inputRef} placeholder="Spotify ID" style={{ padding: "10px 8px", border: "0px", borderRadius: "2px" }} />
                    <button id="SpotifyLoginLink" onClick={redirectToMain} style={{ margin: "0px", height: "40px" }}>Search</button>
                </div>




                <button id="GuestLoginLink" onClick={logout}>Back to Home</button>
            </div>
            {message}


            <div className='dropdownMenu' ref={hintRef} style={{ width: "90vw", maxWidth: "800px", backgroundColor: "var(--dull-accent-color)", textAlign: "left", padding: "10px", paddingTop: "0px", borderRadius: "2px", display: "block", borderLeft: "4px solid gray", margin: "auto" }}>
                {/* <button onClick={() => setIsDropped(!isDropped)}>How can I find my profile? </button> */}
                <h2 onClick={() => setIsDropped(!isDropped)} style={{ marginBottom: "0px" }}>How can I find my profile?</h2>

                {isDropped &&
                    < >
                        <hr />
                        <p>
                            To find your Spotify profile's ID, copy the link to your profile and paste the name between <span style={{ backgroundColor: "black", paddingLeft: "2px", paddingRight: "2px", borderRadius: "4px" }}>/user/</span> and <span style={{ backgroundColor: "black", paddingLeft: "2px", paddingRight: "2px", borderRadius: "4px" }}>?</span>.
                        </p>
                        <p>

                            For example, my share link is:
                        </p>

                        <div style={{ margin: "10px", textAlign: "center", backgroundColor: "black", padding: "2px", borderRadius: "4px", textWrap: "balance" }}>
                            <span style={{ opacity: "0.6" }}>https://open.spotify.com/user/</span>jd76h9cddqc2heszq1eyjhl52<span style={{ opacity: "0.6" }}>?si=5a83</span>
                        </div>


                        <p>
                            so my Spotify ID is <span style={{ fontWeight: "bold" }}>jd76h9cddqc2heszq1eyjhl52</span>.
                        </p>
                    </>
                }
            </div>




        </div>
    )
}