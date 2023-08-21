import React from "react";
import { technologies } from "../../Constants";

const index = () => {
  return (
    <div className="wrapper h-screen flex items-center">
        <div className="flex flex-col lg:flex-row lg:w-[80%] mx-auto gap-[20px] justify-between">
            <div className="w-[50%]">hello</div>

            <div className="grid grid-cols-3 lg:grid-cols-4 gap-8 items-center mx-auto">
                {technologies.map((tech, index) => (
                <div key={index} className="text-center hover:scale-125 transition-all ease-in-out duration-200">
                    <img
                        src={tech.icon}
                        className="w-[120px] mx-auto"
                        alt={tech.name}
                    />
                </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default index;
