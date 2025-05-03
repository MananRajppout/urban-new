import React from 'react';

const AssistantChatMessage = ({ msgString }) => {

    //regex working for all the links i.e whether it is .com .org .org/login or https:// or www.
    const urlRegex =
        /((?:https?:\/\/|www\.)[-a-z0-9]+(?:\.[-a-z0-9]+)*(?:\.[a-z]{2,})+(?:\/[^\/\s]*)*)\b/;

    //domain name matching regex
    const domainName = (url) => {
        const match = url.match(/(?:http(?:s)?:\/\/)?(?:w{3}\.)?([^\/]+\.[^\/]+)(\/.*)?/i);
        return match ? match[1] + (match[2] || "") : null;
    };


    const renderLine = (line, index) => {
        if (/^\d+\./.test(line)) {
            const indexOfFullStop = line.indexOf(".");
            const partBeforeFullStop = line.substring(0, indexOfFullStop);
            const partAfterFullStop = line.substring(indexOfFullStop + 1);

            const lineWithLinks = partAfterFullStop.split(urlRegex).map((segment, i) => {
                if (i % 2 === 1) {
                    const url = segment.startsWith("www.") ? `http://${segment}` : segment;
                    return (
                        <a key={i} href={url} style={{
                            textDecoration: 'underline'
                        }} target="_blank" rel="noopener noreferrer">
                            {domainName(url)}
                        </a>
                    );
                } else {
                    return segment;
                }
            });


            return (
                <div key={index} className="list-item">
                    <span className="before-full-stop">{partBeforeFullStop}.</span>
                    <span> {lineWithLinks}</span>
                </div>
            );
        } else {

            const lineWithLinks = line.split(urlRegex).map((segment, i) => {
                if (i % 2 === 1) {
                    const url = segment.startsWith("www.") ? `http://${segment}` : segment;
                    return (
                        <a key={i} style={{
                            textDecoration: 'underline'
                        }} href={url} target="_blank" rel="noopener noreferrer">
                            {domainName(url)}
                        </a>
                    );
                } else {
                    return segment;
                }
            });

            return <p className='non-list-item' key={index}>{lineWithLinks}</p>;
        }
    };

    return (
        <>
            {msgString.split('\n\n').join('\n').split("\n").map((line, index) => renderLine(line, index))}
        </>
    );
};

export default AssistantChatMessage;
