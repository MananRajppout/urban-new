import React from 'react';

function AnimatedButton({onClick}) {
  return (
    <button onClick={onClick}  class="bg-transparent hover:bg-gray-700 hover:border-white text-white font-semibold p-5 hover:text-white border border-white hover:border-transparent rounded-full cursor-pointer">
      Get the Call
    </button>
  );
}

export default AnimatedButton;
