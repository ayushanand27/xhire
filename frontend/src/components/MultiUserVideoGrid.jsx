import { useState } from "react";
import "./MultiUserVideoGrid.css";

export default function MultiUserVideoGrid({ participants: initialParticipants }) {
  const [participants] = useState(initialParticipants || []);
  const [focusedParticipant, setFocusedParticipant] = useState(null);
  const [gridSize, setGridSize] = useState("3");

  const getGridClass = () => {
    const count = participants.length;
    if (count <= 1) return "grid-1";
    if (count <= 2) return "grid-2";
    if (count <= 4) return "grid-2x2";
    if (count <= 6) return "grid-2x3";
    if (count <= 9) return "grid-3x3";
    return "grid-responsive";
  };

  if (participants.length === 0) {
    return (
      <div className="video-grid-container empty">
        <div className="empty-state">
          <div className="empty-icon">📹</div>
          <p>Waiting for participants to join...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-grid-container">
      <div className="video-grid-header">
        <div className="participant-count">
          {participants.length} {participants.length === 1 ? "participant" : "participants"}
        </div>
        <div className="grid-controls">
          <button
            className={`grid-btn ${gridSize === "fit" ? "active" : ""}`}
            onClick={() => setGridSize("fit")}
            title="Fit to screen"
          >
            🔲
          </button>
          <button
            className={`grid-btn ${gridSize === "focus" ? "active" : ""}`}
            onClick={() => setGridSize("focus")}
            title="Focus mode"
          >
            🎯
          </button>
        </div>
      </div>

      {gridSize === "focus" && focusedParticipant ? (
        // Focus Mode
        <div className="video-focus-container">
          <div className="focused-video">
            <div className="video-placeholder">
              <img
                src={focusedParticipant.user.profileImage}
                alt={focusedParticipant.user.name}
                className="participant-avatar"
              />
              <div className="participant-info">
                <h3>{focusedParticipant.user.name}</h3>
                <span className={`status ${focusedParticipant.role}`}>
                  {focusedParticipant.role}
                </span>
              </div>
            </div>

            <div className="media-status-overlay">
              <span className={focusedParticipant.mediaStatus.cameraOn ? "on" : "off"}>
                {focusedParticipant.mediaStatus.cameraOn ? "📹" : "📹‍🚫"}
              </span>
              <span className={focusedParticipant.mediaStatus.microphoneOn ? "on" : "off"}>
                {focusedParticipant.mediaStatus.microphoneOn ? "🎤" : "🔇"}
              </span>
            </div>
          </div>

          <div className="thumbnail-bar">
            {participants.map((participant) => (
              <div
                key={participant._id}
                className={`thumbnail ${
                  focusedParticipant._id === participant._id ? "active" : ""
                }`}
                onClick={() => setFocusedParticipant(participant)}
              >
                <img
                  src={participant.user.profileImage}
                  alt={participant.user.name}
                  className="thumbnail-img"
                />
                <div className="thumbnail-label">{participant.user.name}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Grid Mode
        <div className={`video-grid ${getGridClass()}`}>
          {participants.map((participant) => (
            <div
              key={participant._id}
              className="video-tile"
              onClick={() => {
                if (gridSize === "fit") {
                  setGridSize("focus");
                  setFocusedParticipant(participant);
                }
              }}
            >
              <div className="video-placeholder">
                <img
                  src={participant.user.profileImage}
                  alt={participant.user.name}
                  className="participant-avatar"
                />
              </div>

              <div className="video-overlay">
                <div className="participant-label">
                  <h4>{participant.user.name}</h4>
                  <span className={`role-badge ${participant.role}`}>
                    {participant.role}
                  </span>
                </div>

                <div className="media-indicators">
                  <span
                    className={`media-icon ${
                      participant.mediaStatus.cameraOn ? "on" : "off"
                    }`}
                    title={
                      participant.mediaStatus.cameraOn ? "Camera on" : "Camera off"
                    }
                  >
                    📹
                  </span>
                  <span
                    className={`media-icon ${
                      participant.mediaStatus.microphoneOn ? "on" : "off"
                    }`}
                    title={
                      participant.mediaStatus.microphoneOn ? "Mic on" : "Mic off"
                    }
                  >
                    🎤
                  </span>
                  {participant.mediaStatus.screenSharing && (
                    <span
                      className="media-icon on"
                      title="Screen sharing"
                    >
                      🖥️
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
