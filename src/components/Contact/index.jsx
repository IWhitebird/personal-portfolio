import React, { useEffect, useState } from "react";
import { useRef } from "react";
import "./Contact.css";
import DecoderText from "../DecoderText";
import { AiOutlineSend } from "react-icons/ai";
import Fade from "react-reveal/Fade";

const Contact = () => {
  const textareaRef = useRef(null);
  const inputText = "Say hi to me!";
  const [decode, setDecode] = useState(false);

  const autoGrow = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "77px";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <>
      <Fade left onReveal={() => setDecode(true)}> 
        <div className="wrapper">
          <div id="contact" className="contact">

            <div className="contact_heading font-mons text-black text-left">
              <DecoderText text={inputText} start={decode} />
            </div>
        
            <hr className="animatedhr" />
        
            <form action="POST">
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
                    Your Email:
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
                    <div className="flex flex-row-reverse gap-3 w-full justify-center">
                      <AiOutlineSend className="mt-1" />
                      <p> Send me a message </p>
                    </div>
                  </button>
                </div>

              </div>
            </form>

          </div>
        </div>
      </Fade>
    </>
  );
};

export default Contact;
