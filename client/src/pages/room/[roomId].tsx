import { useEffect, useState, useRef, type SetStateAction } from "react";
import Head from "next/head";
import io, { type Socket } from "socket.io-client";
import { useRouter } from "next/router";
import Editor from "@monaco-editor/react";
import { useLocalStorage, useEffectOnce, useIsClient } from "usehooks-ts";
import { baseUrl } from "~/utils";

type socketData = {
  html: string;
  css: string;
  js: string;
  dateTime: string;
}

const Room = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<socketData>({
    html: "",
    css: "",
    js: "",
    dateTime: "",
  });
  const router = useRouter();
  const { roomId } = router.query;
  const [details, setDetails] = useLocalStorage("details", {
    name: "",
    room: "",
    isAdmin: false,
  });
  const isClient = useIsClient();

  //editor states

  const [html, setHtml] = useLocalStorage("html", "<h1>Hello World</h1>");
  const [css, setCss] = useLocalStorage(
    "css",
    `h1{
      color: red;
    }`
  );
  const [js, setJs] = useLocalStorage("js", "//alert('Hello World')");
  //editor code

  const [language, setLanguage] = useState("html");

  const [code, setCode] = useState(`<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>
          ${css}
      </style>
  </head>
  <body>
      ${html}
      <script>
          ${js}
      </script>
  </body>
  </html>`);

  const outputRef = useRef(null) as unknown as { current: HTMLIFrameElement };

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleRunCode = () => {
    const iframe = outputRef.current;
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    console.log(iframeDoc);

    iframeDoc?.open();
    iframeDoc?.write(code);
    iframeDoc?.close();
  };

  useEffect(() => {
    setCode(
      `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Document</title>
        <style>
            ${css}
        </style>
    </head>
    <body>
        ${html}
        <script>
            ${js}
        </script>
    </body>
    </html>`
    );
  }, [html, css, js, setCode]);

  useEffectOnce(() => {
    //sleep for 1 second
    setTimeout(() => {
      handleRunCode();
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
      handleRunCode();
    }
  };

  // first useEffect hook for initializing socket connection
  useEffect(() => {
    const newSocket = io(baseUrl);
    setSocket(newSocket);

    newSocket.emit("joinRoom", roomId);

    newSocket.on("joinRoomError", (errorMessage: string) => {
      setErrorMessage(errorMessage);
    });

    newSocket.on("newMemberJoinedRoom", () => {
      console.log("A new member has joined the room");
    });

    newSocket.on("memberLeftRoom", () => {
      console.log("A member has left the room");
    });

    newSocket.on("dataReceived", (data:socketData) => {
      if (data?.html) {
        setHtml(data.html);
        console.log(data.html);
      }
      if (data?.css) setCss(data.css);
      if (data?.js) {
        setJs(data.js);
        console.log(data.js);
      }
      setTimeout(() => {
        handleRunCode();
      }, 500);
      //refresh the page
      window.location.reload();
      console.log("Data received: ", data);
    });

    return () => {
      newSocket.off("joinRoomError");
      newSocket.off("newMemberJoinedRoom");
      newSocket.off("memberLeftRoom");
      newSocket.off("dataReceived");
      newSocket.disconnect();
      setSocket(null);
    };
  }, [handleRunCode, roomId, setCss, setHtml, setJs]); // <-- dependency array should only contain roomId

  // second useEffect hook for handling state updates
  useEffect(() => {
    if (socket === null) {
      // handle state updates here, if necessary
    }
  }, [socket]); // only called when socket value changes

  const handleSendData = () => {
    // make varibale for date and time
    const today = new Date();
    const date = `${today.getFullYear()}-${
      today.getMonth() + 1
    }-${today.getDate()}`;

    const time = `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

    const dateTime = date + " " + time;

    if (socket) {
      const sendData = {
        html,
        css,
        js,
        dateTime,
      };
      socket.emit("sendData", roomId, sendData);
      setData(sendData);
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
    <>
      <Head>
        <title>Room {roomId}</title>
      </Head>
      <h1 className="mb-6 text-2xl">Room {roomId}</h1>
      {errorMessage && (
        <div className="mb-6 bg-red-100 p-4 text-red-900">{errorMessage}</div>
      )}
      {/* <div className="mb-6">
        {isClient && details.isAdmin && (
          <button
            type="button"
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white"
            onClick={handleSendData}
          >
            Send Data
          </button>
        )}
      </div>
      <div>
        {data && (
          <div className="mb-6 bg-gray-100 p-4">
            <p>
              {data.message} at {data.time}
            </p>
          </div>
        )}
      </div> */}
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
            onClick={handleRunCode}
          >
            Run Code
          </button>

          {isClient && details.isAdmin && (
            <button
              type="button"
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white"
              onClick={() => {
                handleRunCode();

                handleSendData();
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
        </div>

        <iframe className="h-80" title="output" ref={outputRef} />
      </div>
    </>
  );
};
export default Room;
