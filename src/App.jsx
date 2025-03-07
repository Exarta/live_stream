import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PlayerForm from "./Initial";
import GameFpsMul from "./pages/fps-html-multiplayer";
// import GameFps from "./pages/fps-html";
// import Game from "./pages/fps-scene";
// import Simple from "./pages/simple";
// import PlayCanvasScene from "./pages/chck.jsx";
// import YouTube from "./pages/youtube3d.jsx";
// import VideoChat from "./pages/VideoChat.jsx";
import GameHome from "./pages/home";
import "./App.css";
import VideoChat from "./pages/VideoChat";

function App() {
  const [playerData, setPlayerData] = useState(null);

  return (
    <Router>
      <Routes>
        {/* Player Form */}
        <Route
          path="/"
          // element={<PlayerForm onPlayerReady={setPlayerData} socket={socket} />}
          element={<PlayerForm />}
          // element={<VideoChat />}
        />
        {/* Multiplayer Game (Pass socket & playerData) */}
        {/* <Route path="/multiplayer" element={<GameHome />} /> */}
        {/* working gaming multiplayer */}
        <Route path="/multiplayer" element={<GameFpsMul />} />
      </Routes>
    </Router>
  );
}

export default App;
