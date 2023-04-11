import React from "react";
import { EditorComponent } from "~/components/EditorComponent";
import { useLocalStorage } from "usehooks-ts";
function Code() {
  const [html, setHtml] = useLocalStorage("html", "<h1>Hello World</h1>");
  const [css, setCss] = useLocalStorage(
    "css",
    `h1{
      color: red;
    }`
  );
  const [js, setJs] = useLocalStorage("js", "//alert('Hello World')");

  return (
    <div>
      <EditorComponent
        html={html}
        css={css}
        js={js}
        setHtml={setHtml}
        setCss={setCss}
        setJs={setJs}
        details={{ name: "test", room: "test", isAdmin: false }}
      />
    </div>
  );
}

export default Code;
