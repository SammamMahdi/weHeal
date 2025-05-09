import React, {useState, useCallback} from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const [roomCode, setRoomCode] = useState("");
    const [username, setUsername] = useState("");
    const navigate = useNavigate();

    const handleJoinRoom = useCallback(() => {
        if (!roomCode.trim() || !username.trim()) {
            alert("Please enter both room code and username");
            return;
        }
        navigate(`/room/${roomCode}?username=${encodeURIComponent(username)}`);
    }, [navigate, roomCode, username]);

    return (
        <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '10px', 
            maxWidth: '300px', 
            margin: '50px auto',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px'
        }}>
            <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                type="text"
                placeholder="Enter your username"
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                type="text"
                placeholder="Enter room code"
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <button 
                onClick={handleJoinRoom}
                style={{
                    padding: '10px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
            >
                Join Room
            </button>
        </div>
    );
};

export default HomePage;