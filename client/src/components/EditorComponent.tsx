import {
  useEffect,
  useState,
  useRef,
  type SetStateAction,
  type Dispatch,
} from "react";
import Editor from "@monaco-editor/react";
import { useEffectOnce, useIsClient } from "usehooks-ts";
import { handleRunCode, htmlGenerator } from "~/utils";

export type SetValue<T> = Dispatch<SetStateAction<T>>;

export function EditorComponent({
  html,
  css,
  js,
  setHtml,
  setCss,
  setJs,
  details,
  handleSendData,
}: {
  html: string;
  css: string;
  js: string;
  setHtml: SetValue<string>;
  setCss: SetValue<string>;
  setJs: SetValue<string>;
  details: { name: string; room: string; isAdmin: boolean };
  handleSendData?: () => void;
}) {
  const isClient = useIsClient();

  const [language, setLanguage] = useState("html");

  const [code, setCode] = useState(htmlGenerator(html, css, js));

  const outputRef = useRef<HTMLIFrameElement>(null);

  // editor functions
  function handleEditorChange(
    value: SetStateAction<string | undefined>,
    _event: unknown
  ) {
    if (typeof value === "string") {
      if (language === "html") {
        setHtml(value);
      }
      if (language === "css") {
        setCss(value);
      }
      if (language === "js") {
        setJs(value);
      }
    }
  }

  useEffect(() => {
    setCode(htmlGenerator(html, css, js));
  }, [html, css, js, setCode]);

  useEffectOnce(() => {
    //sleep for 1 second
    setTimeout(() => {
      handleRunCode(outputRef, code);
    }, 500);
  });

  const handleKeyDown = (event: {
    preventDefault: () => void;
    which: number;
    ctrlKey: unknown;
    metaKey: unknown;
  }) => {
    const charCode = String.fromCharCode(event.which).toLowerCase();
    if ((event.ctrlKey || event.metaKey) && charCode === "s") {
      event.preventDefault();
      handleRunCode(outputRef, code);
    }
  };

  //download code
  const downloadRef = useRef<HTMLAnchorElement>(null);

  const handleDownload = (): void => {
    console.log("download");

    const content = code;
    const filename = "example.html";
    const element = downloadRef.current;

    if (element) {
      element.href = URL.createObjectURL(
        new Blob([content], { type: "text/html" })
      );
      element.download = filename;
      element.click();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="h-90">
        <div className="tabs tabs-boxed">
          <a
            className={`tab ${language === "html" ? "tab-active" : ""}`}
            onClick={() => {
              setLanguage("html");
            }}
          >
            html
          </a>
          <a
            className={`tab ${language === "css" ? "tab-active" : ""}`}
            onClick={() => {
              setLanguage("css");
            }}
          >
            css
          </a>
          <a
            className={`tab ${language === "js" ? "tab-active" : ""}`}
            onClick={() => {
              setLanguage("js");
            }}
          >
            js
          </a>
        </div>
        <div className="" onKeyDown={handleKeyDown}>
          {language === "html" && (
            <Editor
              height="50vh"
              defaultLanguage="html"
              onChange={handleEditorChange}
              value={html}
            />
          )}
          {language === "css" && (
            <Editor
              height="50vh"
              defaultLanguage="css"
              onChange={handleEditorChange}
              value={css}
            />
          )}
          {language === "js" && (
            <Editor
              height="50vh"
              defaultLanguage="javascript"
              onChange={handleEditorChange}
              value={js}
            />
          )}
        </div>
      </div>
      <div className="flex gap-5">
        <button
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white"
          onClick={() => {
            handleRunCode(outputRef, code);
          }}
        >
          Run Code
        </button>

        {isClient && details.isAdmin && (
          <button
            type="button"
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white"
            onClick={() => {
              handleRunCode(outputRef, code);

              handleSendData?.();
            }}
          >
            Send Code
          </button>
        )}

        <button
          type="button"
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white"
          onClick={() => {
            handleDownload();
          }}
        >
          Download HTML
        </button>
        <a ref={downloadRef} style={{ display: "none" }}></a>

        <a
          href="/preview"
          target="_blank"
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white"
        >
          Preview in new tab
        </a>
      </div>

      <iframe className="h-80" title="output" ref={outputRef} />
    </div>
  );
}
