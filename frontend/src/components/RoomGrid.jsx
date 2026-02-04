import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { roomAPI } from "../api/rooms.js";
import CreateRoomModal from "./CreateRoomModal.jsx";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import PageShell, { PageContainer } from "./PageShell.jsx";
import "./RoomGrid.css";

export default function RoomGrid() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roomTypeFilter, setRoomTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.getAllRooms({ isPublic: true });
      setRooms(response.data.rooms || response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch rooms: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter rooms based on search and room type
  useEffect(() => {
    let filtered = rooms;

    if (searchTerm) {
      filtered = filtered.filter(
        (room) =>
          room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (room.description &&
            room.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (roomTypeFilter) {
      filtered = filtered.filter((room) => room.roomType === roomTypeFilter);
    }

    setFilteredRooms(filtered);
    setCurrentPage(1);
  }, [searchTerm, roomTypeFilter, rooms]);

  // Pagination
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRooms = filteredRooms.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleRoomCreated = (roomId) => {
    setShowCreateModal(false);
    if (roomId) {
      navigate(`/room/${roomId}`);
    } else {
      fetchRooms();
    }
  };

  const handleJoinRoom = async (roomId) => {
    try {
      await roomAPI.joinRoom(roomId);
      navigate(`/room/${roomId}`);
    } catch (err) {
      // If already a participant, just navigate
      if (err.response?.status === 400) {
        navigate(`/room/${roomId}`);
      } else {
        alert("Failed to join room: " + (err.response?.data?.error || err.message));
      }
    }
  };

  if (loading) {
    return (
      <PageShell>
        <Navbar />
        <main className="flex-1 py-8">
          <PageContainer>
            <div className="text-muted-foreground">Loading rooms...</div>
          </PageContainer>
        </main>
        <Footer />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <Navbar />
      <main className="flex-1 py-8">
        <PageContainer>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Collaboration Rooms</h1>
              <p className="text-muted-foreground mt-1">Join a room to collaborate with others or create your own</p>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Room
            </button>
          </div>

      {/* Filters */}
      <div className="room-filters">
        <input
          type="text"
          placeholder="Search rooms by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={roomTypeFilter}
          onChange={(e) => setRoomTypeFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Room Types</option>
          <option value="interview">Interview</option>
          <option value="study">Study Group</option>
          <option value="collab">Collaboration</option>
          <option value="practice">Practice</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Room Grid */}
      {paginatedRooms.length > 0 ? (
        <>
          <div className="rooms-grid">
            {paginatedRooms.map((room) => (
              <div key={room._id} className="room-card">
                <div className="room-card-header">
                  <h3>{room.name}</h3>
                  <span className={`room-type-badge ${room.roomType}`}>
                    {room.roomType}
                  </span>
                </div>

                <p className="room-description">{room.description}</p>

                <div className="room-info">
                  <div className="info-item">
                    <span className="label">Participants:</span>
                    <span className="value">
                      {room.participants?.length || 0}/{room.maxParticipants}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">Language:</span>
                    <span className="value">{room.language || "Any"}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">Status:</span>
                    <span className={`status ${room.isActive ? "active" : "inactive"}`}>
                      {room.isActive ? "🟢 Active" : "🔴 Inactive"}
                    </span>
                  </div>
                </div>

                <div className="room-footer">
                  {room.participants?.length >= room.maxParticipants ? (
                    <button className="join-btn disabled" disabled>
                      Room Full
                    </button>
                  ) : (
                    <button
                      className="join-btn"
                      onClick={() => handleJoinRoom(room._id)}
                    >
                      Join Room →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>

              <div className="page-info">
                Page {currentPage} of {totalPages}
              </div>

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No rooms found. Create one to get started!</p>
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <CreateRoomModal
          onClose={() => setShowCreateModal(false)}
          onRoomCreated={handleRoomCreated}
        />
      )}
        </PageContainer>
      </main>
      <Footer />
    </PageShell>
  );
}
