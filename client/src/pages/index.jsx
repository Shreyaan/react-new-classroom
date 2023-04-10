import { useState, useEffect } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3000");

export default function Home() {
  const [roomName, setRoomName] = useState("");
  const [username, setUsername] = useState("");
  const [data, setData] = useState("");
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on("roomList", (roomList) => {
      setRooms(roomList);
    });
  }, []);

  const createRoom = () => {
    socket.emit("createRoom", roomName);
    setRoomName("");
  };

  const joinRoom = (/** @type {string} */ roomName) => {
    socket.emit("joinRoom", roomName, username);
  };

  const sendData = (/** @type {string} */ roomName, /** @type {string} */ data) => {
    socket.emit("sendDataToRoom", roomName, data);
    setData("");
  };

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-100 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Socket.IO Demo
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Create and join rooms and send data to others in the same room using
          Socket.IO.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h3 className="mt-2 text-2xl font-bold text-gray-900">
              Create a Room
            </h3>
            <div className="mt-1">
              <input
                id="roomName"
                name="roomName"
                type="text"
                autoComplete="roomName"
                placeholder="Room Name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mt-3">
              <button
                type="submit"
                onClick={createRoom}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Create
              </button>
            </div>
          </div>
          <hr className="my-6 border-gray-200" />
          <div className="text-center">
            <h3 className="mt-2 text-2xl font-bold text-gray-900">
              Join a Room
            </h3>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mt-1">
              <select
                id="roomList"
                name="roomList"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              >
                <option value="">Select a Room</option>
                {rooms.map((roomName) => (
                  <option key={roomName} value={roomName}>
                    {roomName}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3">
              <button
                type="submit"
                onClick={() => joinRoom(roomName)}
                disabled={!username || !roomName}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Join
              </button>
            </div>
          </div>
          <hr className="my-6 border-gray-200" />
          <div className="text-center">
            <h3 className="mt-2 text-2xl font-bold text-gray-900">Send Data</h3>
            <div className="mt-1">
              <textarea
                id="data"
                name="data"
                placeholder="Enter Data to Send"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="mt-3">
              <button
                type="submit"
                onClick={() => sendData(roomName, data)}
                disabled={!data}
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
