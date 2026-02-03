import { useState } from "react";
import { roomAPI } from "../api/rooms.js";
import "./CreateRoomModal.css";

export default function CreateRoomModal({ onClose, onRoomCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    roomType: "collab",
    language: "javascript", // default, user picks in editor
    isPublic: true,
    maxParticipants: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError("Room name is required");
      return;
    }

    try {
      setLoading(true);
      const response = await roomAPI.createRoom(formData);
      const roomId = response.data?.room?._id || response.data?._id;
      onRoomCreated(roomId);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create room: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Room</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <form onSubmit={handleSubmit} className="create-room-form">
          {/* Room Name */}
          <div className="form-group">
            <label htmlFor="name">Room Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., JavaScript Interview"
              maxLength="100"
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this room for?"
              rows="2"
              maxLength="500"
            />
          </div>

          {/* Room Type */}
          <div className="form-group">
            <label htmlFor="roomType">Room Type</label>
            <select
              id="roomType"
              name="roomType"
              value={formData.roomType}
              onChange={handleChange}
            >
              <option value="interview">Interview</option>
              <option value="collab">Collaboration</option>
              <option value="practice">Practice</option>
            </select>
          </div>

          {/* Public checkbox */}
          <div className="form-group checkbox-group">
            <label htmlFor="isPublic">
              <input
                type="checkbox"
                id="isPublic"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleChange}
              />
              <span>Public room (anyone with link can join)</span>
            </label>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "Creating..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
