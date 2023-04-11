import {
  useEffect,
  useState,
  useRef,
  type SetStateAction,
  type Dispatch,
} from "react";
import Head from "next/head";
import io, { type Socket } from "socket.io-client";
import { useRouter } from "next/router";
import Editor from "@monaco-editor/react";
import { useLocalStorage, useEffectOnce, useIsClient } from "usehooks-ts";
import { baseUrl, htmlGenerator } from "~/utils";

type SetValue<T> = Dispatch<SetStateAction<T>>;

type socketData = {
  html: string;
  css: string;
  js: string;
  dateTime: string;
};

const Room = () => {
  const router = useRouter();
  const { roomId } = router.query;

  //socket states
  const [socket, setSocket] = useState<Socket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<socketData>({
    html: "",
    css: "",
    js: "",
    dateTime: "",
  });

  const [details, setDetails] = useLocalStorage("details", {
    name: "",
    room: "",
    isAdmin: false,
  });

  //editor states

  const [html, setHtml] = useLocalStorage("html", "<h1>Hello World</h1>");
  const [css, setCss] = useLocalStorage(
    "css",
    `h1{
      color: red;
    }`
  );
  const [js, setJs] = useLocalStorage("js", "//alert('Hello World')");

  // editor display state

  //socket functions

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

    newSocket.on("dataReceived", (data: socketData) => {
      if (data?.html) {
        setHtml(data.html);
        console.log(data.html);
      }
      if (data?.css) setCss(data.css);
      if (data?.js) {
        setJs(data.js);
        console.log(data.js);
      }
      // setTimeout(() => {
      //   ();handleRunCode
      // }, 500);
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
  }, [roomId]);

  // second useEffect hook for handling state updates
  useEffect(() => {
    if (socket === null) {
      // handle state updates here, if necessary
    }
  }, [socket]); // only called when socket value changes

  const handleSendData = () => {
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

  return (
    <>
      <Head>
        <title>Room {roomId}</title>
      </Head>
      <h1 className="mb-6 text-2xl">Room {roomId}</h1>
      {errorMessage && (
        <div className="mb-6 bg-red-100 p-4 text-red-900">{errorMessage}</div>
      )}
      <EditorComponent
        html={html}
        css={css}
        js={js}
        setHtml={setHtml}
        setCss={setCss}
        setJs={setJs}
        details={details}
        handleSendData={handleSendData}
      />
    </>
  );
};
export default Room;

function EditorComponent({
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
    setCode(htmlGenerator(html, css, js));
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
      </div>

      <iframe className="h-80" title="output" ref={outputRef} />
    </div>
  );
}
