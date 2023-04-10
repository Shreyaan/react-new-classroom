import { useEffect, useState } from "react";
import Head from "next/head";
import io, { Socket } from "socket.io-client";
import { useRouter } from "next/router";
import { useLocalStorage } from "usehooks-ts";

const Room = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const router = useRouter();
  const { roomId } = router.query;
  const [details, setDetails] = useLocalStorage("details", {
    name: "",
    room: "",
    isAdmin: false,
  });

  // first useEffect hook for initializing socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.emit("joinRoom", roomId);

    newSocket.on("joinRoomError", (errorMessage) => {
      setErrorMessage(errorMessage);
    });

    newSocket.on("newMemberJoinedRoom", () => {
      console.log("A new member has joined the room");
    });

    newSocket.on("memberLeftRoom", () => {
      console.log("A member has left the room");
    });

    newSocket.on("dataReceived", (data) => {
      setData(data);
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
  }, [roomId]); // <-- dependency array should only contain roomId

  // second useEffect hook for handling state updates
  useEffect(() => {
    if (socket === null) {
      // handle state updates here, if necessary
    }
  }, [socket]); // only called when socket value changes

  const handleSendData = () => {
    // make varibale for date and time
    var today = new Date();
    var date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    var time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + " " + time;

    if (socket) {
      socket.emit("sendData", roomId, {
        message: "Hello, world!",
        time: dateTime,
      });
      setData({ message: "Hello, world!", time: dateTime });
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
      <div className="mb-6">
        {details.isAdmin && (
          <button
            type="button"
            className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={handleSendData}
          >
            Send Data
          </button>
        )}
      </div>
      <div>
        {data && (
          <div className="mb-6 bg-gray-100 p-4">
            <p>{data.time}</p>
          </div>
        )}
      </div>
    </>
  );
};
export default Room;
