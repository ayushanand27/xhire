import { useState } from "react";
import { roomAPI } from "../api/rooms.js";
import "./CreateRoomModal.css";

export default function CreateRoomModal({ onClose, onRoomCreated }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    roomType: "collab",
    language: "javascript",
    isPublic: true,
    maxParticipants: 10,
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
      await roomAPI.createRoom(formData);
      onRoomCreated();
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
              placeholder="e.g., JavaScript Study Group"
              maxLength="100"
              required
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this room for?"
              rows="3"
              maxLength="500"
            />
            <span className="char-count">
              {formData.description.length}/500
            </span>
          </div>

          {/* Room Type */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="roomType">Room Type *</label>
              <select
                id="roomType"
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
              >
                <option value="interview">Interview</option>
                <option value="study">Study Group</option>
                <option value="collab">Collaboration</option>
                <option value="practice">Practice</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="language">Primary Language *</label>
              <select
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="ruby">Ruby</option>
              </select>
            </div>
          </div>

          {/* Max Participants */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="maxParticipants">Max Participants *</label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                min="2"
                max="100"
                required
              />
            </div>

            <div className="form-group checkbox-group">
              <label htmlFor="isPublic">
                <input
                  type="checkbox"
                  id="isPublic"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                />
                <span>Make this room public</span>
              </label>
              <small>
                {formData.isPublic
                  ? "Anyone can discover and join this room"
                  : "Only invited users can join"}
              </small>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
