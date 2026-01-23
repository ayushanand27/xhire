import { useState } from "react";
import { participantAPI } from "../api/rooms.js";
import "./ParticipantsList.css";

export default function ParticipantsList({ roomId, currentUserRole, participants = [] }) {
  const [expandedParticipant, setExpandedParticipant] = useState(null);
  const [loading, setLoading] = useState({});

  const canModerate = currentUserRole === "host" || currentUserRole === "moderator";

  const handleRoleChange = async (participantId, newRole) => {
    if (!canModerate) return;

    try {
      setLoading((prev) => ({ ...prev, [participantId]: true }));
      await participantAPI.updateParticipantRole(roomId, participantId, newRole);
      // Trigger refresh via parent component
      window.dispatchEvent(new CustomEvent("participantUpdated"));
    } catch (error) {
      alert("Failed to update role: " + error.message);
    } finally {
      setLoading((prev) => ({ ...prev, [participantId]: false }));
    }
  };

  const handlePermissionToggle = async (participantId, permission) => {
    if (!canModerate) return;

    try {
      setLoading((prev) => ({ ...prev, [participantId]: true }));
      const participant = participants.find((p) => p._id === participantId);
      const updatedPermissions = {
        ...participant.permissions,
        [permission]: !participant.permissions[permission],
      };
      await participantAPI.updateParticipantPermissions(
        roomId,
        participantId,
        updatedPermissions
      );
      window.dispatchEvent(new CustomEvent("participantUpdated"));
    } catch (error) {
      alert("Failed to update permissions: " + error.message);
    } finally {
      setLoading((prev) => ({ ...prev, [participantId]: false }));
    }
  };

  const handleRemoveParticipant = async (participantId) => {
    if (!canModerate) return;
    if (!window.confirm("Remove this participant from the room?")) return;

    try {
      setLoading((prev) => ({ ...prev, [participantId]: true }));
      await participantAPI.removeParticipant(roomId, participantId);
      window.dispatchEvent(new CustomEvent("participantUpdated"));
    } catch (error) {
      alert("Failed to remove participant: " + error.message);
    } finally {
      setLoading((prev) => ({ ...prev, [participantId]: false }));
    }
  };

  return (
    <div className="participants-list">
      <div className="participants-header">
        <h3>Participants ({participants.length})</h3>
      </div>

      <div className="participants-content">
        {participants.length === 0 ? (
          <div className="no-participants">No participants yet</div>
        ) : (
          participants.map((participant) => (
            <div
              key={participant._id}
              className={`participant-item ${
                expandedParticipant === participant._id ? "expanded" : ""
              }`}
            >
              <div
                className="participant-main"
                onClick={() =>
                  setExpandedParticipant(
                    expandedParticipant === participant._id ? null : participant._id
                  )
                }
              >
                <img
                  src={participant.user.profileImage}
                  alt={participant.user.name}
                  className="participant-avatar"
                />

                <div className="participant-info">
                  <h4>{participant.user.name}</h4>
                  <div className="participant-meta">
                    <span className={`role-badge ${participant.role}`}>
                      {participant.role}
                    </span>
                    <span className="status">
                      {participant.mediaStatus.cameraOn && "📹"}
                      {participant.mediaStatus.microphoneOn && "🎤"}
                      {!participant.mediaStatus.cameraOn &&
                        !participant.mediaStatus.microphoneOn && (
                          <span className="offline">offline</span>
                        )}
                    </span>
                  </div>
                </div>

                <div className="expand-icon">
                  {expandedParticipant === participant._id ? "▼" : "▶"}
                </div>
              </div>

              {/* Expanded Details */}
              {expandedParticipant === participant._id && canModerate && (
                <div className="participant-actions">
                  {/* Role Selection */}
                  <div className="action-section">
                    <label>Role:</label>
                    <div className="role-options">
                      {["member", "moderator"].map((role) => (
                        <button
                          key={role}
                          className={`role-option ${
                            participant.role === role ? "active" : ""
                          }`}
                          onClick={() => handleRoleChange(participant._id, role)}
                          disabled={loading[participant._id]}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="action-section">
                    <label>Permissions:</label>
                    <div className="permission-toggles">
                      {[
                        { key: "canEdit", label: "Edit Code", icon: "✏️" },
                        { key: "canExecute", label: "Execute", icon: "▶" },
                        { key: "canScreenShare", label: "Screen Share", icon: "🖥️" },
                        { key: "canChat", label: "Chat", icon: "💬" },
                      ].map((perm) => (
                        <button
                          key={perm.key}
                          className={`permission-toggle ${
                            participant.permissions[perm.key] ? "enabled" : ""
                          }`}
                          onClick={() =>
                            handlePermissionToggle(participant._id, perm.key)
                          }
                          disabled={loading[participant._id]}
                          title={perm.label}
                        >
                          <span className="icon">{perm.icon}</span>
                          <span className="label">{perm.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <div className="action-section">
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveParticipant(participant._id)}
                      disabled={loading[participant._id]}
                    >
                      🗑️ Remove Participant
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
