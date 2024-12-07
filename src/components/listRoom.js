import React, { useState, useEffect } from 'react';
import { Container, Form, Modal, Button, Row, Col, Card } from 'react-bootstrap';
import './listRoom.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { DoSonRooms, CatBaRooms, MinhKhaiRooms } from './rooms'; // Import child components
import { Colors } from 'chart.js';

const ListRoom = () => {
  const [roomData, setRoomData] = useState([]);
  const [locations, setLocation] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatedCategory, setUpdatedCategory] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('');
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const [bookingId, setBookingId] = useState('');

  useEffect(() => {
    const storedUser = user
    if (storedUser && storedUser.role) {
      setUserRole(storedUser.role);

      // If user is 'staffds', set a default location and hide location dropdown
      if (storedUser.role === 'staff_ds') {
        setSelectedLocation('66f6c536285571f28087c16b');
      } else if (storedUser.role === 'staff_cb') {
        setSelectedLocation('66f6c59f285571f28087c16d');
      } else if (storedUser.role === 'staff_mk') {
        setSelectedLocation('66f6c5c9285571f28087c16a');
      }
    }
    axios
      .get('https://server-j956.onrender.com/rooms')
      .then((response) => setRoomData(response.data))
      .catch((error) => console.error('Error fetching room data:', error));

    axios
      .get('https://server-j956.onrender.com/locations')
      .then((response) => setLocation(response.data))
      .catch((error) => console.error('Error fetching locations:', error));

    axios
      .get('https://server-j956.onrender.com/roomCategories')
      .then((response) => setCategories(response.data))
      .catch((error) => console.error('Error fetching room categories:', error));
  }, []);

  const filteredRooms = selectedLocation
    ? roomData.filter((room) => room.roomCategoryId.locationId === selectedLocation)
    : roomData;
  const filteredCategories = selectedLocation
    ? categories.filter((category) => category.locationId._id === selectedLocation)
    : categories;
  // Count rooms by status
  const countRoomsByStatus = (rooms) => {
    const counts = { available: 0, booked: 0, inUse: 0, inFix: 0 };

    rooms.forEach((room) => {
      if (room.status === 'Trống') counts.available++;
      if (room.status === 'Đã book') counts.booked++;
      if (room.status === 'Đang sử dụng') counts.inUse++;
      if (room.status === 'Đang sửa chữa') counts.inFix++;
    });

    return counts;
  };

  const roomCounts = countRoomsByStatus(filteredRooms);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setUpdatedCategory(room.roomCategoryId._id);
    setUpdatedStatus(room.status);
    setBookingId(room.bookingId?._id);
    setShowModal(true);
  };

  const handleUpdate = () => {
    const updatedRoom = {
      ...selectedRoom,
      roomCategoryId: updatedCategory,
      status: updatedStatus,
    };

    axios
      .put(`https://server-j956.onrender.com/rooms/${selectedRoom._id}`, updatedRoom)
      .then((response) => {
        axios
          .get('https://server-j956.onrender.com/rooms')
          .then((res) => setRoomData(res.data))
          .catch((error) => console.error('Error fetching updated room data:', error));
       
        setShowModal(false);
        const newNotification = { content: `Phòng ${selectedRoom.code} đã chuyển trạng thái sang ${updatedStatus}.` };
                axios
                .post("https://server-j956.onrender.com/chats/send", newNotification)
                .then((response) => {
                console.log(response.data);
                })
      })
      .catch((error) => console.error('Error updating room:', error));
  };

  const handleClose = () => setShowModal(false);

  return (
    <Container>
      <h2 className="text-center my-4">Sơ đồ phòng và tình trạng phòng</h2>


      {userRole === "admin" && (
        <Form.Group controlId="categorySelect" className="my-4" style={{ width: '50%' }}>
          <Form.Label>Chọn cơ sở:</Form.Label>
          <Form.Control
            as="select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">Chọn cơ sở</option>
            <option value="66f6c42f285571f28087c16a">cơ sở 16 Minh Khai</option>
            <option value="66f6c536285571f28087c16b">cơ sở Đồ Sơn</option>
            <option value="66f6c59f285571f28087c16d">cơ sở Cát Bà</option>
          </Form.Control>
        </Form.Group>
      )}

      {/* Display Room Status Counts */}

      <Row>
        <Col>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Tổng số phòng trống</Card.Title>
              <Card.Text>{roomCounts.available}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Tổng số phòng được đặt</Card.Title>
              <Card.Text>
                {roomCounts.booked}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Tổng số phòng đang sử dụng</Card.Title>
              <Card.Text>{roomCounts.inUse}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Conditionally Render Room Components Based on Selected Location */}
      {selectedLocation === '66f6c536285571f28087c16b' && (
        <DoSonRooms rooms={filteredRooms} onClick={handleRoomClick} />
      )}
      {selectedLocation === '66f6c59f285571f28087c16d' && (
        <CatBaRooms rooms={filteredRooms} onClick={handleRoomClick} />
      )}
      {selectedLocation === '66f6c42f285571f28087c16a' && (
        <MinhKhaiRooms rooms={filteredRooms} onClick={handleRoomClick} />
      )}

      <div className="note">
        <button style={{ backgroundColor: "red", color: "white", padding: "10px", borderRadius: "5px", width: "150px", border: "none", margin: "5px" }}>
          Đang sửa chữa
        </button>
        <button style={{ backgroundColor: "#d3d3d3", color: "black", padding: "10px", borderRadius: "5px", width: "150px", border: "none", margin: "5px" }}>
          Trống
        </button>
        <button style={{ backgroundColor: "yellow", color: "black", padding: "10px", borderRadius: "5px", width: "150px", border: "none", margin: "5px" }}>
          Đã book
        </button>
        <button style={{ backgroundColor: "lightgreen", color: "black", padding: "10px", borderRadius: "5px", width: "150px", border: "none", margin: "5px" }}>
          Đang sử dụng
        </button>
      </div>


      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật thông tin phòng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoom && (
            <>
              {user?.role === "admin" && (
                <Form.Group controlId="categorySelect">
                  <Form.Label>Loại phòng:</Form.Label>
                  <Form.Control
                    as="select"
                    value={updatedCategory}
                    onChange={(e) => setUpdatedCategory(e.target.value)}
                  >
                    {filteredCategories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              )}
              <Form.Group controlId="statusSelect" className="mt-3">
                <Form.Label>Trạng thái phòng:</Form.Label>
                <Form.Control
                  as="select"
                  value={updatedStatus}
                  onChange={(e) => {
                    setUpdatedStatus(e.target.value);
                    if (e.target.value !== "Đang sử dụng" && e.target.value !== "Đã book") {
                      setBookingId(""); // Clear bookingId if status is not "Đang sử dụng"
                    }
                  }}
                >
                  <option value="Trống">Trống</option>
                  <option value="Đã book">Đã book</option>
                  <option value="Đang sử dụng">Đang sử dụng</option>
                  <option value="Đang sửa chữa">Đang sửa chữa</option>
                </Form.Control>
              </Form.Group>

              {updatedStatus === "Đã book" && (
                <Form.Group controlId="bookingIdInput" className="mt-3">
                  <Form.Label>Booking ID:</Form.Label>
                  <Form.Control
                    type="text"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    required
                  />
                </Form.Group>
              )}
            </>
          )}
          {updatedStatus === "Đang sử dụng" && (
            <Form.Group controlId="bookingIdInput" className="mt-3">
              <Form.Label>Booking ID:</Form.Label>
              <Form.Control
                type="text"
                value={bookingId}
                onChange={(e) => setBookingId(e.target.value)}
                required
              />
            </Form.Group>
          )}

        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleUpdate} style={{ marginRight: '10px' }}>
            Cập nhật
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ListRoom;
