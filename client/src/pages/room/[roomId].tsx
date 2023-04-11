import { useEffect, useState } from "react";
import Head from "next/head";
import io, { type Socket } from "socket.io-client";
import { useRouter } from "next/router";
import { useLocalStorage } from "usehooks-ts";
import { baseUrl } from "~/utils";
import { EditorComponent } from "../../components/EditorComponent";


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