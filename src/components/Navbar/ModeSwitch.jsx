import React, { useId , useContext } from "react";
import { MyContext } from "../../MyContext";
import "./ModeSwitch.css";


const  ModeSwitch = ({ handleClick }) => {
 
  const { mode , setMode } = useContext(MyContext);

 
  return (
    <>
      <div onClick={handleClick}  

      className={`cursor-pointer fixed right-[1.5rem] top-[0] w-[48px] h-[48px]
      flex items-center justify-center
      lg:hover:scale-110
      transition-all duration-200 ease-in-out z-[60]`}

      >

        <input id="toggle" class="toggle" type="checkbox" checked={mode === 'light'}></input>
      </div>
    </>
  );
};

export default ModeSwitch;
