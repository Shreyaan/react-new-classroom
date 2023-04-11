/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { useState } from "react";
import Head from "next/head";
import io from "socket.io-client";
import { useRouter } from "next/router";
import { useLocalStorage } from "usehooks-ts";

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [details, setDetails] = useLocalStorage<{
    name: string;
    room: string;
    isAdmin: boolean;
  }>("details", { name: "", room: "", isAdmin: false });

  const handleCreateRoom = () => {
    const socket = io("https://reactnewclassroom.onrender.com");
    socket.emit("createRoom", roomId);
    socket.on("roomCreated", (roomId: string) => {
      setDetails({ name: "Admin", room: roomId, isAdmin: true });
      void router.push(`/room/${roomId}`);
    });
  };

  const handleJoinRoom = () => {
    void router.push(`/room/${roomId}`);
  };

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <div className="mx-auto w-full max-w-sm">
        <label className="mt-4 block">
          <span className="text-gray-700">Room ID</span>
          <input
            type="text"
            placeholder="Room ID"
            className="form-input mt-1 block w-full rounded-md focus:border-blue-500 focus:ring-0"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </label>

        <div className="mt-6">
          <button
            type="button"
            className="mr-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            onClick={handleCreateRoom}
          >
            Create Room
          </button>

          <button
            type="button"
            className="rounded-md border border-blue-500 px-4 py-2 text-blue-500 hover:bg-blue-500 hover:text-white"
            onClick={handleJoinRoom}
          >
            Join Room
          </button>
        </div>
      </div>
    </>
  );
};

export default Home;
