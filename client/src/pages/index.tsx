import { useState } from 'react';
import Head from 'next/head';
import io from 'socket.io-client';
import { useRouter } from 'next/router';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const router = useRouter();

  const handleCreateRoom = () => {
    const socket = io('http://localhost:3001');
    socket.emit('createRoom', roomId);
    socket.on('roomCreated', (roomId) => {
      router.push(`/room/${roomId}`);
    });
  };

  const handleJoinRoom = () => {
    router.push(`/room/${roomId}`);
  };

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>

      <div className="w-full max-w-sm mx-auto">
        <label className="block mt-4">
          <span className="text-gray-700">Room ID</span>
          <input
            type="text"
            placeholder="Room ID"
            className="form-input mt-1 block w-full rounded-md focus:ring-0 focus:border-blue-500"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </label>

        <div className="mt-6">
          <button
            type="button"
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md mr-2"
            onClick={handleCreateRoom}
          >
            Create Room
          </button>

          <button
            type="button"
            className="border border-blue-500 hover:bg-blue-500 text-blue-500 hover:text-white py-2 px-4 rounded-md"
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