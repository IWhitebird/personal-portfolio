import React from "react";
import { useRef } from "react";
import "./Contact.css";
import DecoderText from "../DecoderText";
import { AiOutlineSend } from "react-icons/ai";

const Contact = () => {
  const textareaRef = useRef(null);
  const inputText = "Say hi to me!";

  const autoGrow = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "77px";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="contact">
      <div className="contact_heading font-mons text-black text-left">
        <DecoderText text={inputText} />
      </div>
      <hr className="animatedhr" />
      <form action="POST">
        <span></span>
        <div className="formplaceholder text-left font-mons">
          
          <div class="input-field animated-element ">
            <input
              type="text"
              id="email"
              class="custom-input"
              autoComplete="off"
              required
            />
            <label for="email" class="custom-label">
              Your email:
            </label>
          </div>

          <div class="input-field animated-element">
            <textarea
              ref={textareaRef}
              onInput={autoGrow}
              id="message"
              class="custom-input2"
              autoComplete="off"
              required
            ></textarea>
            <label for="message" class="custom-label2">
              Message:
            </label>
          </div>

          <div className="flex h-[80px]">
            <button className="sendbutton animated-element" type="submit">
            <div className="flex flex-row gap-3 w-full justify-center">
              <AiOutlineSend className="mt-1" /> 
              <p> Send me a message </p>
            </div>
            </button>
          </div>


        </div>
      </form>
    </div>
  );
};

export default Contact;
