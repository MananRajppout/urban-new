import React, { useEffect, useState } from "react";

export default function SlowTypeText({ text }) {
    const [displayText, setDisplayText] = useState('')


    useEffect(() => {
        let index = 0;
        const textArr = text.split(' ')
        const typingInterval = setInterval(() => {
            setDisplayText((prevText) => prevText + ' ' + textArr[index]);
            index++;

            if (index == textArr.length) {
                clearInterval(typingInterval);
            }
        }, 100); // Adjust the delay (in milliseconds) as needed

        return () => {
            clearInterval(typingInterval);
        };

    }, []);

    return <p>{displayText}</p>
}