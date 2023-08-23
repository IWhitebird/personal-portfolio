import React, { useId , useContext } from "react";
import { MyContext } from "../../MyContext";
import "./ModeSwitch.css";


const  ModeSwitch = ({ handleClick }) => {
 
  const { mode , setMode } = useContext(MyContext);

 
  return (
    <>
      <div onClick={handleClick}  

      className={`cursor-pointer fixed right-[2.5rem] top-[2rem] z-100 w-[45px] h-[45px] 
      lg:hover:scale-125 ${mode == 'light' ? 'hover:bg-[#1d1d1d42]': 'hover:bg-[#5858588b]'} 
      transition-all duration-200 ease-in-out rounded-md`}

      >

        <input id="toggle" class="toggle" type="checkbox" checked={mode === 'light'}></input>
      </div>
    </>
  );
};

export default ModeSwitch;
