import React from 'react';

const HighPerformanceCursor = () => {


    return (
        <style>
            {`
        * {
            cursor: url('/images/svg.png') 16 16, auto;
        }
        html, body {
          cursor: url('/images/svg.png') 16 16, auto;
        }
        a, button {
          cursor: url('/images/svg.png') 16 16, pointer;
        }
      `}
        </style>
    );
};

export default HighPerformanceCursor;