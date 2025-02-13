import { useState, useEffect, useCallback } from "react";


export default function ProgressBar({ children, state }) {
    const [gradient, setGradient] = useState("");

    /**
      * Update the colors on the different sections of the progress
      * bar according to the current guess.
      */
    const updateDynamicGradient = useCallback(() => {
        const computedStyles = getComputedStyle(document.querySelector('body'));

        // Get the current colors of the theme css variables
        const dullAccent = computedStyles.getPropertyValue("--dull-accent-color").trim();
        const secondaryBtn = computedStyles.getPropertyValue("--secondary-btn-color").trim();
        const pageBg = computedStyles.getPropertyValue("--page-background-color").trim();

        let gradient = `linear-gradient(to right, ${dullAccent} 0% 6%, `;

        let lastPercent = 6.25; // Starting percentage of the gradient (100/(2^4))
        for (let i = 0; i < 4; i++) {
            gradient += `${secondaryBtn} ${lastPercent}% calc(${lastPercent}% + 2px),`;
            let dynamicColor = i < state.guesses.length ? dullAccent : pageBg;
            gradient += `${dynamicColor} calc(${lastPercent}% + 2px) ${lastPercent + lastPercent}%, `;
            lastPercent += lastPercent;
        }

        setGradient(gradient.slice(0, -2) + ")");
    }, [state.guesses]);


    /**
     * Update the progress bar's colors when a new guess has been made.
     */
    useEffect(() => {
        updateDynamicGradient();
    }, [state.guesses, updateDynamicGradient]);


    /**
     * Update the profile bar's color when the theme changes.
     */
    useEffect(() => {
        const observer = new MutationObserver(() => updateDynamicGradient());
        observer.observe(document.querySelector('body'), { attributes: true, attributeFilter: ["data-theme"] });
        return () => observer.disconnect();
    }, [updateDynamicGradient]);


    return (
        <>
            <input id='trackProgress' type='range' value={state.pbarValue} min={0} max={1600} step={1} disabled style={{background:`${gradient}`}} />
            <div>

                <span className='submissionBar'>
                    <span className='noselect'>0:{String(Math.floor(state.pbarValue / 100 + 0.1)).padStart(2, '0')}</span>

                    {children}

                    <span className='noselect'>0:{String(state.maxPlaybackLength / 1000).padStart(2, '0')}</span>
                </span>

            </div>

        </>
    )
}