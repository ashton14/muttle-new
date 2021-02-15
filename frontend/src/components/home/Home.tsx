import React from 'react';
import Highlighter from '../code/Highlighter';

const CODE = `const woah = fun => fun + 1;
const dude = woah(2) + 3;
def thisIsAFunction() {
  return [1,2,3].map(n => n + 1).filter(n !== 3);
}
console.log('making up fake code is really hard')
function itIs() {
  return 'no seriously really it is';
}`;

const Home = () => {
  const options = {
    lineNumbers: true,
    mode: 'javascript',
  };

  return <Highlighter value={CODE} options={options} />;
};

export default Home;
