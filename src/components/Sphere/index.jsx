import {useContext, useState} from 'react';
import DisplacementSphere from './DisplacementSphere';
import { MyContext } from '../../MyContext';


const Sphere = () => {

  const {mode , setMode} = useContext(MyContext);


  return (
    <div>
        <DisplacementSphere mode={mode} />
    </div>
  );
};

export default Sphere;
