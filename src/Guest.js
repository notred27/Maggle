import { useRef, useState } from "react";
import useToken from "./hooks/useToken";
import { useNavigate } from 'react-router-dom';




export default function Guest() {
    const { setToken, getToken } = useToken();
    const [message, setMessage] = useState("");
    const nav = useNavigate();
    const inputRef = useRef(null);

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
            setMessage(`There doesn't appear to be any Spotify with id "${inputRef.current.value}". Please ensure that the id you entered is correct.`)
        }
    }


    return (
        <div>
            <h2>Please enter the target profile:</h2>

            <br />
          
            {message}
            <br />


            <input ref={inputRef} placeholder="Spotify ID" />
            <button onClick={redirectToMain}>Go</button>


            <br />
            <br />

            <button onClick={logout}>Back</button>


            <br />

            <h3>To find your own profile id, copy the link to your profile and paste the name between "/user/" and "?".
            For example, my share link is "https://open.spotify.com/user/jd76h9cddqc2heszq1eyjhl52?si=5a800d24db6b4523",
            so I would paste "jd76h9cddqc2heszq1eyjhl52". </h3>

        </div>
    )
}