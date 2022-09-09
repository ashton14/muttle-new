import React from 'react';
import dynamic from 'next/dynamic';
import 'bootstrap/dist/css/bootstrap.css';


import { HighlighterProps } from '../components/code/Highlighter';

const Highlighter = dynamic<HighlighterProps>(() => import('../components/code/Highlighter'), { ssr: false });

const CODE = `def woah = lambda fun: fun + 1
dude = woah(2) + 3;
def this_is_a_function(): 
  return filter(lambda n: n != 3, 
    map(lambda n: n + 1, [1, 2, 3])

print('making up fake code is really hard')
def it_is():
  return 'no seriously really it is'
`;

const Home = () => {
  const options = {
    lineNumbers: true,
    mode: 'python',
  };

  return <Highlighter value={CODE} options={options} />;
};

export default Home;
