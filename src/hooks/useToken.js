// import { useState } from "react";

export default function useToken() {

    // const [token, setToken] = useState(null);


    const setToken = (token, ttl) => {
        const now = new Date()

        const item = {
            value: token,
            expiry: now.getTime() + ttl,
        }
        window.localStorage.setItem("token", JSON.stringify(item))
    }

    const getToken = () => {
        const itemStr = window.localStorage.getItem("token")
        if (!itemStr) {
            return null
        }
        const item = JSON.parse(itemStr)
        const now = new Date()

        if (now.getTime() > item.expiry) {
            window.localStorage.removeItem("token")
            return null
        }
        return item.value
    }


    return {setToken, getToken}

}