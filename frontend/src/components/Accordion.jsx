import React, { useState } from 'react';

const Accordion = ({ placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleAccordion = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            <div
                className='source-title'
            >
                {placeholder.data.length} suggested resources available for <strong className='strong-text' onClick={toggleAccordion}>{placeholder.text}</strong>
            </div>
            {isOpen && (
                <div className='list-links'>
                    {placeholder.data.map((el, index) => {
                        return (
                            <a href={el} key={index} rel="noreferrer" target='_blank'>source[{index}]</a>
                        )
                    })}
                </div>
            )}
        </>
    );
};

export default Accordion