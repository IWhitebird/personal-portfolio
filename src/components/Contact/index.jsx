import React, { useState } from "react";
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
    if (textareaRef.current.scrollHeight) {
      textareaRef.current.style.height = "70px";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <>
      <Fade left onReveal={() => setDecode(true)}> 
        
        <div className="wrapper w-[80%] max-h-[20vh] mx-auto lg:w-full theme transition-colors duration-300 ease-in">

          <div id="contact" className="contact">

            <div className="contact_heading font-mons lg:text-left text-4xl font-bold lg:text-6xl">
              <DecoderText text={inputText} start={decode} />
            </div>
        
            <div className="animatedhr" />
        
            <form action={`https://formspree.io/f/${process.env.REACT_APP_MAIL_KEY}`} method="POST" > 

              <div className="formplaceholder text-left font-mons">
                <div class="input-field animated-element ">
                  <input
                    type="text"
                    id="email"
                    name="email"
                    class="custom-input"
                    autoComplete="off"
                    required
                  />
                  <label for="email" class="custom-label">
                    Your Email:
                  </label>
                </div>

                <div class="input-field animated-element inpt-2">
                  <textarea
                    ref={textareaRef}
                    onInput={autoGrow}
                    id="message"
                    name="message"
                    class="custom-input2"
                    autoComplete="off"
                    required
                    rows={2}
                  ></textarea>
                  <label for="message" class="custom-label2">
                    Message:
                  </label>
                </div>

                <div className="flex h-auto items-center mb-7">
                  <button className="sendbutton animated-element mx-auto" type="submit">
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

      <div className="theme font-mons text-md font-bold lg:text-right lg:mr-3">
                 <p>
                  © 2023 Shreyas Patange. Crafted with ❤️ by IWhitebird.
                </p>
         </div>
    </>
  );
};

export default Contact;
