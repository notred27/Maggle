import { useState, useRef, useEffect } from 'react';
import useSound from 'use-sound';

import playIcon from './icons/play.svg';
import pauseIcon from './icons/pause.svg';


export default function PlayButton({ audioUrl, volume, maxPlaybackLength, inputVal }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [play, { stop, sound }] = useSound(audioUrl,
        {
            volume: volume,
        }); // Initialize useSound
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
        inputVal(0);

        if (isPlaying) {
            stop(); // Stop the audio

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        } else {

            play(); // Play the audio

            timeoutRef.current = setTimeout(() => {
                stop();
                setIsPlaying(false); // Update state to indicate the sound has stopped
                inputVal(0);

            }, maxPlaybackLength); // 5000 ms = 5 seconds
        }
        setIsPlaying(!isPlaying); // Toggle the playing state
    };





    useEffect(() => {
        if (!isPlaying) return;

        const updateProgress = () => {
            console.log(sound.seek())
            inputVal(sound.seek() * 100) ;
        };

        const interval = setInterval(updateProgress, 10);

        return () => clearInterval(interval);
    }, [sound, isPlaying]);


    return (
        <>
            {!isPlaying ?
                <img src={playIcon} onClick={handleToggle} disabled={!audioUrl} style={{ width: "30px" }} />

                :
                <img src={pauseIcon} onClick={handleToggle} disabled={!audioUrl} style={{ width: "30px" }} />

            }
        </>


    )
}