import { useState, useRef, useEffect } from 'react';
import useSound from 'use-sound';

import playIcon from './icons/play.svg';
import pauseIcon from './icons/pause.png';


export default function PlayButton({ audioUrl, volume, maxPlaybackLength }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [play, { stop, sound }] = useSound(audioUrl, { volume: volume }); // Initialize useSound
    const timeoutRef = useRef(null);




    // Stop playing when the audioUrl changes
    useEffect(() => {
        if (isPlaying) {
            stop()
        };
        setIsPlaying(false);

        return () => stop();
    }, [audioUrl, sound]);

  


    const handleToggle = () => {
        if (isPlaying) {
            stop(); // Stop the audio

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        } else {
            console.log("Playing sound...");
            play(); // Play the audio

            timeoutRef.current = setTimeout(() => {
                stop();
                setIsPlaying(false); // Update state to indicate the sound has stopped

            }, maxPlaybackLength); // 5000 ms = 5 seconds
        }
        setIsPlaying(!isPlaying); // Toggle the playing state
    };




    return (
        <>
            {!isPlaying ?
                <img src = {playIcon} onClick={handleToggle} disabled={!audioUrl} style={{width:"30px"}}/>

                :
                <img src= {pauseIcon} onClick={handleToggle} disabled={!audioUrl} style={{width:"30px"}}/>

            }
        </>


    )
}