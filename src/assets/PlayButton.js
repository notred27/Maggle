import { useState, useRef, useEffect } from 'react';
import useSound from 'use-sound';

import playIcon from './../icons/play.svg';
import loadIcon from './../icons/loading-play.svg';
import pauseIcon from './../icons/pause.svg';


export default function PlayButton({ audioUrl, volume, maxPlaybackLength, inputVal }) {
    const [isPlaying, setIsPlaying] = useState(false);
    // Include tmp URL so useSOund initially renders
    const [play, { stop, sound }] = useSound(audioUrl ?? "https://cdnt-preview.dzcdn.net/api/1/1/3/2/a/0/32a0640a2e76d7011dd92eb51492aad1.mp3?hdnea=exp=1739817784~acl=/api/1/1/3/2/a/0/32a0640a2e76d7011dd92eb51492aad1.mp3*~data=user_id=0,application_id=42~hmac=c1690f11bdf30428ac72ca0b4af0ece6b76683bd0d4a825a8d92bdcfc0f6c999", 
         { volume: volume});
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