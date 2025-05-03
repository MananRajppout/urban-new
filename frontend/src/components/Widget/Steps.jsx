import React from "react";
import "../../styles/Widget/steps.css";
export default function Steps({ count, index }) {

    const steps = Array.from({ length: count }, (_, stepIndex) => (
        <div key={stepIndex} className="item">
            {index > stepIndex && <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2Zm3.22 6.97-4.47 4.47-1.97-1.97a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l5-5a.75.75 0 1 0-1.06-1.06Z" /></svg>}
            {index < stepIndex && <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Z" /></svg>}
            {index == stepIndex && <svg  fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1.999c5.524 0 10.002 4.478 10.002 10.002 0 5.523-4.478 10.001-10.002 10.001-5.524 0-10.002-4.478-10.002-10.001C1.998 6.477 6.476 1.999 12 1.999Zm0 1.5a8.502 8.502 0 1 0 0 17.003A8.502 8.502 0 0 0 12 3.5Zm-.003 2.5a5.998 5.998 0 1 1 0 11.996 5.998 5.998 0 0 1 0-11.996Z" /></svg>}
        </div>
    ));


    function calculatePercentage() {
        let per = index / (count - 1) * 100

        if (per > 100) per = 100
        return per + '%'
    }

    return (<div className="steps">
        <div className="progress-layer">
            <div className="back">
                <div className="progress" style={{ width: calculatePercentage() }}></div>
            </div>
        </div>
        <div className="item-layer">
            {steps}
        </div>

    </div>)
}