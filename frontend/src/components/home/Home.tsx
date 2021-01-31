import React from 'react';

import SyntaxHighlighter from 'react-syntax-highlighter';

const CODE = `const woah = fun => fun + 1;
const dude = woah(2) + 3;
def thisIsAFunction() {
  return [1,2,3].map(n => n + 1).filter(n !== 3);
}
console.log('making up fake code is really hard')
function itIs() {
  return 'no seriously really it is';
}`;

const ADDED = [1, 2];
const REMOVED = [6];

const Home = () => {
  return (
    <div className="text-left">
      <div style={{paddingTop: 20, display: 'flex'}}>
        <div style={{flex: 1, width: '100%', flexDirection: 'column'}}>
          <SyntaxHighlighter
            language="javascript"
            wrapLines={true}
            showLineNumbers
            lineProps={lineNumber => {
              const style: {display: string; backgroundColor?: string} = {
                display: 'block',
              };
              if (ADDED.includes(lineNumber)) {
                style.backgroundColor = '#dbffdb';
              } else if (REMOVED.includes(lineNumber)) {
                style.backgroundColor = '#ffecec';
              }
              return {style};
            }}
          >
            {CODE}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  );
};

export default Home;
