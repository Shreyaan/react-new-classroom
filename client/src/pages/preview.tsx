import React, { useRef } from "react";
import { useEffectOnce, useLocalStorage } from "usehooks-ts";
import { handleRunCode, htmlGenerator } from "~/utils";

function Preview() {
  const [html, setHtml] = useLocalStorage("html", "<h1>Hello World</h1>");
  const [css, setCss] = useLocalStorage(
    "css",
    `h1{
        color: red;
      }`
  );
  const [js, setJs] = useLocalStorage("js", "//alert('Hello World')");

  const outputRef = useRef<HTMLIFrameElement>(null);

  useEffectOnce(() => {
    //sleep for 1 second
    setTimeout(() => {
      handleRunCode(outputRef, htmlGenerator(html, css, js));
    }, 500);
  });

  return (
    <div>
      {" "}
      <iframe className="w-screen min-h-screen m-0 p-0" title="output" ref={outputRef} />
    </div>
  );
}

export default Preview;
