import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PlayerForm = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setImage(file);
  };

  const handleSubmit = () => {
    if (!name || !image) {
      alert("Please enter your name and upload an image.");
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(image);
    reader.onloadend = () => {
      const playerData = { name, image: reader.result };

      // Navigate to multiplayer game with playerData in state
      navigate("/multiplayer", { state: { playerData } });
    };
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-md w-96 mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Enter Player Details</h2>
      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="border p-2 rounded w-full mb-2"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        Start Game
      </button>
    </div>
  );
};

export default PlayerForm;
