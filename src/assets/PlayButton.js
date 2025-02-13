import { useState, useRef, useEffect } from 'react';
import useSound from 'use-sound';

import playIcon from './../icons/play.svg';
import loadIcon from './../icons/loading-play.svg';
import pauseIcon from './../icons/pause.svg';


export default function PlayButton({ audioUrl, volume, maxPlaybackLength, inputVal }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [play, { stop, sound }] = useSound(audioUrl, { volume: volume });
    const timeoutRef = useRef(null);    // Stop playback if the user has run out of time


    /**
     * Stop playing audio when the audioUrl changes
    */
    useEffect(() => {
        if (isPlaying) {
            stop();
        };
        setIsPlaying(false);

        return () => stop();
    }, [audioUrl, sound]);



    /**
     * Handle when the user clicks the pause/play button.
     * When audio is stopped it should reset playback to the start of the track.
     */
    const handleToggle = () => {
        inputVal(0);    // Will always begin at start of track
        setIsPlaying(!isPlaying);

        if (isPlaying) {
            stop();

            // Stop the timeout from firing at a later time
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        } else {
            play();

            // Automatically stop playback after the guess timer runs out
            timeoutRef.current = setTimeout(() => {
                stop();
                setIsPlaying(false);
                inputVal(0);

            }, maxPlaybackLength);
        }
    };


    /**
     * Continuously increase progress on the progress bar (and timer) as
     * the song is playing.
     */
    useEffect(() => {
        if (!isPlaying) return;

        const updateProgress = () => {
            inputVal(sound.seek() * 100);
        };

        const interval = setInterval(updateProgress, 10);

        return () => clearInterval(interval);
    }, [sound, isPlaying]);


    return (
        <>{sound ? <>
            {!isPlaying ?
                <img alt='playAudio' src={playIcon} onClick={handleToggle} disabled={!audioUrl} style={{ width: "30px" }} />
                :
                <img alt='pauseAudio' src={pauseIcon} onClick={handleToggle} disabled={!audioUrl} style={{ width: "30px" }} />
            }
                </>
            :

            <img alt='playAudio' src={loadIcon} style={{ width: "30px" }} />
           
            }
        </>
    )
}