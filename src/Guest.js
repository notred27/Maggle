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
        <div>
            <h2>Please enter your target profile:</h2>




            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
                <input ref={inputRef} placeholder="Spotify ID" style={{ padding: "10px 8px", border: "0px", borderRadius: "2px" }} />
                <button id="SpotifyLoginLink" onClick={redirectToMain} style={{ margin: "0px", height: "40px" }}>Search</button>
            </div>

            <br />



            <button id="GuestLoginLink" onClick={logout}>Back to Home</button>

            <br />
            {message}
            <br />


            <span className='dropdownMenu' ref={hintRef}>
                <button onClick={() => setIsDropped(!isDropped)}>How can I find my profile? </button>

                {isDropped &&
                    <div>
                        <p>
                            To find your profile id, copy the link to your profile and paste the name between "/user/" and "?".
                        </p>
                        <p>

                            For example, my share link is <span style={{ opacity: "0.6" }}>"https://open.spotify.com/user/</span>jd76h9cddqc2heszq1eyjhl52<span style={{ opacity: "0.6" }}>?si=5a800d24db6b4523"</span>,
                            so I would paste <span style={{ fontWeight: "bold" }}>jd76h9cddqc2heszq1eyjhl52</span>.
                        </p>
                    </div>
                }
            </span>




        </div>
    )
}