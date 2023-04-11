/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { useEffect, useState } from "react";
import Head from "next/head";
import io from "socket.io-client";
import { useRouter } from "next/router";
import { useLocalStorage, useEffectOnce } from "usehooks-ts";
import { baseUrl } from "~/utils";

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [details, setDetails] = useLocalStorage<{
    name: string;
    room: string;
    isAdmin: boolean;
  }>("details", { name: "", room: "", isAdmin: false });
  const [isServerOnline, setIsServerOnline] = useState(false);

  const handleCreateRoom = () => {
    const socket = io(baseUrl);
    socket.emit("createRoom", roomId);
    socket.on("roomCreated", (roomId: string) => {
      setDetails({ name: "Admin", room: roomId, isAdmin: true });
      void router.push(`/room/${roomId}`);
    });
  };

  const handleJoinRoom = () => {
    void router.push(`/room/${roomId}`);
  };
  useEffect(() => {
    if (!isServerOnline) {
      const interval = setInterval(() => {
        fetch(baseUrl + "/ping")
          .then((res) => {
            if (res.status === 200) {
              setIsServerOnline(true);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [setIsServerOnline, isServerOnline]);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <div className="hero min-h-screen">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">
              Hello there, Welcome to new classroom
            </h1>
            <p className="py-6">
              Welcome to our collaborative web application that simplifies
              teaching and coding! <br /> <br />
              Our app allows you to create a virtual room and share your HTML,
              CSS, and JS creations with ease. You can send your code to all
              members of the room, making collaboration effortless. <br />{" "}
              <br />
              Say goodbye to the hassle of sharing code and files through
              multiple channels. With our app, you can focus on teaching and
              creating without technical difficulties.
            </p>
            {isServerOnline ? (
              <div className="mx-auto w-full max-w-sm">
                <input
                  type="text"
                  placeholder="Enter Room ID"
                  className="input-bordered input-primary input w-full max-w-xs"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />

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
            ) : (
              <div className="mx-auto w-full max-w-sm">
                <p className="py-6">
                  Server is offline. Please wait for few seconds.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
