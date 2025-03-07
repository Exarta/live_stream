// import { io } from "socket.io-client";
// import { useRef, useEffect, useState } from "react";
// import { FiVideo, FiVideoOff, FiMic, FiMicOff } from "react-icons/fi";

// const configuration = {
//   iceServers: [
//     {
//       urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
//     },
//   ],
//   iceCandidatePoolSize: 10,
// };

// // Use the appropriate signaling server URL (adjust if needed)
// const socket = io("http://172.16.15.155:5000", { transports: ["websocket"] });

// function VideoChat({ style }) {
//   const startButton = useRef(null);
//   const hangupButton = useRef(null);
//   const muteAudButton = useRef(null);
//   const localVideo = useRef(null);
//   const remoteVideo = useRef(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [audioState, setAudioState] = useState(true);
//   // Use a ref to store the RTCPeerConnection instance
//   const pcRef = useRef(null);

//   // Disable hangup and mute buttons initially
//   useEffect(() => {
//     if (hangupButton.current) hangupButton.current.disabled = true;
//     if (muteAudButton.current) muteAudButton.current.disabled = true;
//   }, []);

//   // Create the peer connection and initiate a call
//   const makeCall = async () => {
//     try {
//       pcRef.current = new RTCPeerConnection(configuration);

//       pcRef.current.onicecandidate = (e) => {
//         const message = {
//           type: "candidate",
//           candidate: null,
//         };
//         if (e.candidate) {
//           message.candidate = e.candidate.candidate;
//           message.sdpMid = e.candidate.sdpMid;
//           message.sdpMLineIndex = e.candidate.sdpMLineIndex;
//         }
//         socket.emit("message", message);
//       };

//       pcRef.current.ontrack = (e) => {
//         if (remoteVideo.current) {
//           remoteVideo.current.srcObject = e.streams[0];
//         }
//       };

//       localStream.getTracks().forEach((track) => {
//         pcRef.current.addTrack(track, localStream);
//       });

//       const offer = await pcRef.current.createOffer();
//       await pcRef.current.setLocalDescription(offer);
//       socket.emit("message", { type: "offer", sdp: offer.sdp });
//     } catch (error) {
//       console.error("Error in makeCall:", error);
//     }
//   };

//   // Handle an incoming offer
//   const handleOffer = async (offer) => {
//     try {
//       if (pcRef.current) {
//         console.error("Peer connection already exists");
//         return;
//       }
//       pcRef.current = new RTCPeerConnection(configuration);
//       pcRef.current.onicecandidate = (e) => {
//         const message = {
//           type: "candidate",
//           candidate: null,
//         };
//         if (e.candidate) {
//           message.candidate = e.candidate.candidate;
//           message.sdpMid = e.candidate.sdpMid;
//           message.sdpMLineIndex = e.candidate.sdpMLineIndex;
//         }
//         socket.emit("message", message);
//       };

//       pcRef.current.ontrack = (e) => {
//         if (remoteVideo.current) {
//           remoteVideo.current.srcObject = e.streams[0];
//         }
//       };

//       localStream.getTracks().forEach((track) => {
//         pcRef.current.addTrack(track, localStream);
//       });

//       await pcRef.current.setRemoteDescription(offer);
//       const answer = await pcRef.current.createAnswer();
//       await pcRef.current.setLocalDescription(answer);
//       socket.emit("message", { type: "answer", sdp: answer.sdp });
//     } catch (error) {
//       console.error("Error in handleOffer:", error);
//     }
//   };

//   // Handle an incoming answer
//   const handleAnswer = async (answer) => {
//     try {
//       if (!pcRef.current) {
//         console.error("No peer connection for answer");
//         return;
//       }
//       await pcRef.current.setRemoteDescription(answer);
//     } catch (error) {
//       console.error("Error in handleAnswer:", error);
//     }
//   };

//   // Handle incoming ICE candidates
//   const handleCandidate = async (candidateMessage) => {
//     try {
//       if (!pcRef.current) {
//         console.error("No peer connection for candidate");
//         return;
//       }
//       if (candidateMessage && candidateMessage.candidate) {
//         await pcRef.current.addIceCandidate(candidateMessage);
//       }
//     } catch (error) {
//       console.error("Error in handleCandidate:", error);
//     }
//   };

//   // Hang up the call and reset the state
//   const hangup = () => {
//     if (pcRef.current) {
//       pcRef.current.close();
//       pcRef.current = null;
//     }
//     if (localStream) {
//       localStream.getTracks().forEach((track) => track.stop());
//       setLocalStream(null);
//     }
//     if (startButton.current) startButton.current.disabled = false;
//     if (hangupButton.current) hangupButton.current.disabled = true;
//     if (muteAudButton.current) muteAudButton.current.disabled = true;
//   };

//   // Start the call by getting user media and signaling readiness
//   const startCall = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: { echoCancellation: true },
//       });
//       setLocalStream(stream);
//       if (localVideo.current) {
//         localVideo.current.srcObject = stream;
//         localVideo.current.muted = true;
//       }
//     } catch (error) {
//       console.error("Error accessing media devices:", error);
//       return;
//     }

//     if (startButton.current) startButton.current.disabled = true;
//     if (hangupButton.current) hangupButton.current.disabled = false;
//     if (muteAudButton.current) muteAudButton.current.disabled = false;

//     socket.emit("message", { type: "ready" });
//   };

//   // Toggle audio mute/unmute by enabling/disabling the audio track
//   const muteAudio = () => {
//     if (localStream && localStream.getAudioTracks().length > 0) {
//       localStream.getAudioTracks()[0].enabled = !audioState;
//       setAudioState(!audioState);
//     }
//   };

//   // Set up socket listeners to handle signaling messages
//   useEffect(() => {
//     socket.on("message", (message) => {
//       if (!localStream) {
//         console.log("Local stream not available yet");
//         return;
//       }
//       switch (message.type) {
//         case "offer":
//           handleOffer(message);
//           break;
//         case "answer":
//           handleAnswer(message);
//           break;
//         case "candidate":
//           handleCandidate(message);
//           break;
//         case "ready":
//           if (pcRef.current) {
//             console.log("Already in call, ignoring ready signal");
//             return;
//           }
//           makeCall();
//           break;
//         case "bye":
//           hangup();
//           break;
//         default:
//           console.log("Unhandled message:", message);
//           break;
//       }
//     });
//     return () => {
//       socket.off("message");
//     };
//   }, [localStream]);

//   return (
//     <main style={style}>
//       <div className="video bg-main border-none">
//         <video
//           ref={localVideo}
//           className="video-item border-none"
//           autoPlay
//           playsInline
//         />
//         <video
//           ref={remoteVideo}
//           className="video-item border-none"
//           autoPlay
//           playsInline
//         />
//       </div>

//       <div className="btn">
//         <button
//           className="btn-item btn-start"
//           ref={startButton}
//           onClick={startCall}
//         >
//           <FiVideo />
//         </button>
//         <button
//           className="btn-item btn-end"
//           ref={hangupButton}
//           onClick={hangup}
//         >
//           <FiVideoOff />
//         </button>
//         <button
//           className="btn-item btn-start"
//           ref={muteAudButton}
//           onClick={muteAudio}
//         >
//           {audioState ? <FiMic /> : <FiMicOff />}
//         </button>
//       </div>
//     </main>
//   );
// }

// export default VideoChat;

import { io } from "socket.io-client";
import { useRef, useEffect, useState } from "react";
import { FiVideo, FiVideoOff, FiMic, FiMicOff } from "react-icons/fi";

const configuration = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

// Use the appropriate signaling server URL (adjust if needed)
const socket = io("https://livestream-backend.tenant-7654b5-asrpods.ord1.ingress.coreweave.cloud/", { transports: ["websocket"] });

function VideoChat({ style }) {
  const startButton = useRef(null);
  const hangupButton = useRef(null);
  const muteAudButton = useRef(null);
  const localVideo = useRef(null);
  const remoteVideoRefs = useRef({});
  const [localStream, setLocalStream] = useState(null);
  const [audioState, setAudioState] = useState(true);
  // Track connections with multiple peers
  const [peerConnections, setPeerConnections] = useState({});
  // Track remote video streams
  const [remoteStreams, setRemoteStreams] = useState({});
  // For debugging purposes
  const [connectionState, setConnectionState] = useState("Not connected");

  // Initialize buttons
  useEffect(() => {
    if (hangupButton.current) hangupButton.current.disabled = true;
    if (muteAudButton.current) muteAudButton.current.disabled = true;

    // Log socket connection
    console.log(
      "Socket state:",
      socket.connected ? "Connected" : "Disconnected"
    );
    socket.on("connect", () => {
      console.log("Socket connected successfully");
      setConnectionState("Socket connected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setConnectionState(`Socket error: ${err.message}`);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  }, []);

  // Set up remote video stream directly
  useEffect(() => {
    // This effect runs when remoteStreams changes
    Object.entries(remoteStreams).forEach(([peerId, stream]) => {
      if (remoteVideoRefs.current[peerId] && stream) {
        console.log(`Setting stream for peer ${peerId} to video element`);
        if (remoteVideoRefs.current[peerId].srcObject !== stream) {
          remoteVideoRefs.current[peerId].srcObject = stream;
        }
      }
    });
  }, [remoteStreams]);

  // Create a peer connection for a specific peer
  const createPeerConnection = async (peerId, isInitiator) => {
    try {
      console.log(
        `Creating peer connection with ${peerId}, initiator: ${isInitiator}`
      );
      setConnectionState(`Creating connection with ${peerId}`);

      const pc = new RTCPeerConnection(configuration);

      // Log connection state changes
      pc.onconnectionstatechange = () => {
        console.log(`Connection state with ${peerId}: ${pc.connectionState}`);
        setConnectionState(`Connection with ${peerId}: ${pc.connectionState}`);
      };

      pc.onicegatheringstatechange = () => {
        console.log(
          `ICE gathering state with ${peerId}: ${pc.iceGatheringState}`
        );
      };

      pc.oniceconnectionstatechange = () => {
        console.log(
          `ICE connection state with ${peerId}: ${pc.iceConnectionState}`
        );
      };

      // Add tracks from local stream
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          console.log(
            `Adding ${track.kind} track to peer connection with ${peerId}`
          );
          pc.addTrack(track, localStream);
        });
      } else {
        console.warn(
          `No local stream available when creating peer connection with ${peerId}`
        );
      }

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`Sending ICE candidate to ${peerId}`);
          socket.emit("rtcSignal", {
            peerId: peerId,
            signal: {
              type: "candidate",
              candidate: event.candidate,
            },
          });
        }
      };

      // Handle incoming tracks (remote video/audio)
      pc.ontrack = (event) => {
        console.log(`Received ${event.track.kind} track from ${peerId}`);
        setConnectionState(`Received ${event.track.kind} track from ${peerId}`);

        if (event.streams && event.streams[0]) {
          console.log(
            `Setting remote stream for ${peerId} - track type: ${event.track.kind}`
          );

          // Create a new object to trigger a re-render
          setRemoteStreams((prev) => ({
            ...prev,
            [peerId]: event.streams[0],
          }));
        }
      };

      // If we're the initiator, create and send an offer
      if (isInitiator) {
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await pc.setLocalDescription(offer);
        console.log(`Sending offer to ${peerId}`);
        socket.emit("rtcSignal", {
          peerId: peerId,
          signal: {
            type: "offer",
            sdp: pc.localDescription,
          },
        });
      }

      // Update peer connections state
      setPeerConnections((prev) => ({
        ...prev,
        [peerId]: pc,
      }));

      return pc;
    } catch (error) {
      console.error(`Error creating peer connection with ${peerId}:`, error);
      setConnectionState(`Error with ${peerId}: ${error.message}`);
      return null;
    }
  };

  // Handle receiving an offer
  const handleOffer = async (peerId, offer) => {
    try {
      console.log(`Handling offer from ${peerId}`);
      setConnectionState(`Received offer from ${peerId}`);
      let pc = peerConnections[peerId];

      if (!pc) {
        pc = await createPeerConnection(peerId, false);
      }

      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log(`Sending answer to ${peerId}`);
        socket.emit("rtcSignal", {
          peerId: peerId,
          signal: {
            type: "answer",
            sdp: pc.localDescription,
          },
        });
      } else {
        console.error(`Failed to create peer connection for ${peerId}`);
      }
    } catch (error) {
      console.error(`Error handling offer from ${peerId}:`, error);
      setConnectionState(`Error with offer from ${peerId}: ${error.message}`);
    }
  };

  // Handle receiving an answer
  const handleAnswer = async (peerId, answer) => {
    try {
      console.log(`Handling answer from ${peerId}`);
      setConnectionState(`Received answer from ${peerId}`);
      const pc = peerConnections[peerId];

      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`Set remote description for ${peerId} successfully`);
      } else {
        console.error(`No peer connection found for ${peerId}`);
      }
    } catch (error) {
      console.error(`Error handling answer from ${peerId}:`, error);
      setConnectionState(`Error with answer from ${peerId}: ${error.message}`);
    }
  };

  // Handle ICE candidate
  const handleCandidate = async (peerId, candidate) => {
    try {
      console.log(`Handling ICE candidate for ${peerId}`);
      const pc = peerConnections[peerId];

      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(`Added ICE candidate for ${peerId} successfully`);
      } else {
        console.error(
          `No peer connection found for ${peerId} to add ICE candidate`
        );
      }
    } catch (error) {
      console.error(`Error handling ICE candidate for ${peerId}:`, error);
    }
  };

  // Hang up call and reset state
  const hangup = () => {
    console.log("Hanging up all connections");
    // Close all peer connections
    Object.entries(peerConnections).forEach(([peerId, pc]) => {
      pc.close();
    });

    // Reset states
    setPeerConnections({});
    setRemoteStreams({});
    setConnectionState("Disconnected");

    // Stop local stream tracks
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // Reset UI
    if (startButton.current) startButton.current.disabled = false;
    if (hangupButton.current) hangupButton.current.disabled = true;
    if (muteAudButton.current) muteAudButton.current.disabled = true;
  };

  // Start call by getting user media
  const startCall = async () => {
    try {
      console.log("Starting call - requesting user media");
      setConnectionState("Requesting media access");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { echoCancellation: true },
      });

      console.log(
        "Media access granted:",
        stream.getTracks().map((t) => t.kind)
      );
      setLocalStream(stream);
      setConnectionState("Media access granted");

      if (localVideo.current) {
        console.log("Setting local video source");
        localVideo.current.srcObject = stream;
      }

      // Emit to server that we're ready for connections
      socket.emit("newPlayer", { name: "User", image: new ArrayBuffer(0) });
      console.log("Emitted newPlayer signal to server");

      // UI updates
      if (startButton.current) startButton.current.disabled = true;
      if (hangupButton.current) hangupButton.current.disabled = false;
      if (muteAudButton.current) muteAudButton.current.disabled = false;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setConnectionState(`Media error: ${error.message}`);
    }
  };

  // Toggle audio
  const muteAudio = () => {
    if (localStream && localStream.getAudioTracks().length > 0) {
      localStream.getAudioTracks()[0].enabled = !audioState;
      setAudioState(!audioState);
      console.log(`Audio ${audioState ? "muted" : "unmuted"}`);
    }
  };

  // Setup socket listeners for WebRTC signaling
  useEffect(() => {
    // When we get a list of existing peers in the room
    socket.on("existingPeers", async (peerIds) => {
      console.log("Existing peers:", peerIds);
      setConnectionState(`Found ${peerIds.length} existing peers`);
      // Create connections with each existing peer
      for (const peerId of peerIds) {
        await createPeerConnection(peerId, true);
      }
    });

    // Handle WebRTC signaling messages
    socket.on("rtcSignal", async (data) => {
      console.log(`Received signal from ${data.from}:`, data.signal.type);
      const { from, signal } = data;

      switch (signal.type) {
        case "offer":
          await handleOffer(from, signal.sdp);
          break;
        case "answer":
          await handleAnswer(from, signal.sdp);
          break;
        case "candidate":
          await handleCandidate(from, signal.candidate);
          break;
        default:
          console.log("Unknown signal type:", signal.type);
      }
    });

    // Handle peers leaving
    socket.on("playerLeft", (peerId) => {
      console.log(`Peer ${peerId} left`);
      setConnectionState(`Peer ${peerId} left`);

      // Close the peer connection
      if (peerConnections[peerId]) {
        peerConnections[peerId].close();
      }

      // Update states to remove the peer
      setPeerConnections((prev) => {
        const newConnections = { ...prev };
        delete newConnections[peerId];
        return newConnections;
      });

      setRemoteStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[peerId];
        return newStreams;
      });
    });

    // Player joined notification
    socket.on("playerJoined", (player) => {
      console.log("Player joined:", player);
      setConnectionState(`Player ${player.id} joined`);
    });

    // Cleanup
    return () => {
      socket.off("existingPeers");
      socket.off("rtcSignal");
      socket.off("playerLeft");
      socket.off("playerJoined");
    };
  }, [peerConnections, localStream]);

  // Create ref callback for remote videos
  const setRemoteVideoRef = (peerId) => (element) => {
    if (element) {
      remoteVideoRefs.current[peerId] = element;
      // If we already have a stream for this peer, set it immediately
      const stream = remoteStreams[peerId];
      if (stream && element.srcObject !== stream) {
        console.log(`Setting stream for ${peerId} in ref callback`);
        element.srcObject = stream;
      }
    }
  };

  return (
    <main style={style}>
      <div
        style={{
          marginBottom: "10px",
          padding: "5px",
          backgroundColor: "#f8f9fa",
          borderRadius: "4px",
        }}
      >
        Status: {connectionState}
      </div>

      <div
        className="videos-section"
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        {/* Local Video at the top */}
        <div
          className="local-video-container"
          style={{
            minHeight: "120px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <h3
            style={{
              padding: "5px",
              margin: "0",
              backgroundColor: "#e9ecef",
              fontSize: "14px",
            }}
          >
            Your Video
          </h3>
          <video
            ref={localVideo}
            className="video-item border-none"
            autoPlay
            playsInline
            muted={true}
            style={{ width: "100%", height: "120px", objectFit: "cover" }}
          />
        </div>

        {/* Remote Videos in a grid */}
        <div
          className="remote-videos-container"
          style={{
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "5px",
            backgroundColor: "#f0f0f0",
          }}
        >
          <h3
            style={{
              padding: "5px",
              margin: "0",
              backgroundColor: "#e9ecef",
              fontSize: "14px",
            }}
          >
            Remote Videos ({Object.keys(remoteStreams).length})
          </h3>

          {Object.keys(remoteStreams).length > 0 ? (
            <div
              className="remote-videos-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                gap: "10px",
                padding: "10px",
              }}
            >
              {Object.entries(remoteStreams).map(([peerId]) => (
                <div
                  key={peerId}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "2px 5px",
                      backgroundColor: "#dee2e6",
                      fontSize: "12px",
                    }}
                  >
                    Peer: {peerId}
                  </div>
                  <video
                    ref={setRemoteVideoRef(peerId)}
                    className="video-item"
                    autoPlay
                    playsInline
                    style={{
                      width: "100%",
                      height: "150px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div
              className="no-remote"
              style={{
                height: "100px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
              }}
            >
              Waiting for peers to connect...
            </div>
          )}
        </div>
      </div>

      <div
        className="btn"
        style={{
          marginTop: "10px",
          display: "flex",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <button
          className="btn-item btn-start"
          ref={startButton}
          onClick={startCall}
          style={{
            padding: "8px 16px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <FiVideo style={{ marginRight: "5px" }} /> Start
        </button>
        <button
          className="btn-item btn-end"
          ref={hangupButton}
          onClick={hangup}
          style={{
            padding: "8px 16px",
            backgroundColor: "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          <FiVideoOff style={{ marginRight: "5px" }} /> End
        </button>
        <button
          className="btn-item btn-audio"
          ref={muteAudButton}
          onClick={muteAudio}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {audioState ? (
            <FiMic style={{ marginRight: "5px" }} />
          ) : (
            <FiMicOff style={{ marginRight: "5px" }} />
          )}
          {audioState ? "Mute" : "Unmute"}
        </button>
      </div>

      <div style={{ marginTop: "10px" }}>
        <p style={{ fontSize: "12px", margin: "5px 0", color: "#666" }}>
          {Object.keys(peerConnections).length > 0
            ? `Connected peers: ${Object.keys(peerConnections).join(", ")}`
            : "No peer connections"}
        </p>
        <p style={{ fontSize: "12px", margin: "5px 0", color: "#666" }}>
          {Object.keys(remoteStreams).length > 0
            ? `Remote streams: ${Object.keys(remoteStreams).join(", ")}`
            : "No remote streams"}
        </p>
      </div>
    </main>
  );
}

export default VideoChat;
