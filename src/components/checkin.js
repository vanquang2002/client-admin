import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { DoSonRooms, CatBaRooms, MinhKhaiRooms } from './checkin_rooms'; // Import child components
import './listRoom.css';

const ListRoom = () => {
  const [roomData, setRoomData] = useState([]);
  const [locations, setLocation] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedRooms, setSelectedRooms] = useState([]);
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const { id } = useParams();
  
  useEffect(() => {
    if (user && user.role) {
      setUserRole(user.role);

      // Set default location based on user role
      if (user.role === 'staff_ds') {
        setSelectedLocation('66f6c536285571f28087c16b');
      } else if (user.role === 'staff_cb') {
        setSelectedLocation('66f6c59f285571f28087c16d');
      } else if (user.role === 'staff_mk') {
        setSelectedLocation('66f6c5c9285571f28087c16a');
      }
    }

    // Fetch room, location, and category data
    axios.get('https://server-j956.onrender.com/rooms')
      .then((response) => setRoomData(response.data))
      .catch((error) => console.error('Error fetching room data:', error));

    axios.get('https://server-j956.onrender.com/locations')
      .then((response) => setLocation(response.data))
      .catch((error) => console.error('Error fetching locations:', error));

    axios.get('https://server-j956.onrender.com/roomCategories')
      .then((response) => setCategories(response.data))
      .catch((error) => console.error('Error fetching room categories:', error));
  }, []);

  const filteredRooms = selectedLocation
    ? roomData.filter((room) => room.roomCategoryId.locationId === selectedLocation)
    : roomData;

  const handleRoomSelect = (roomId) => {
    setSelectedRooms((prev) =>
      prev.includes(roomId) ? prev.filter((id) => id !== roomId) : [...prev, roomId]
    );
  };

  const handleUpdateSelectedRooms = () => {
  
    const rooms = selectedRooms.filter((room) => typeof room !== 'string');
    const updates = rooms.map((room) =>{
      const updatedRoom = {
        ...room,
        bookingId: id,
        status: 'Đang sử dụng',
      };
      axios.put(`https://server-j956.onrender.com/rooms/${room._id}`,
        updatedRoom
      )

      axios.put(`https://server-j956.onrender.com/bookings/${id}`,
        {
          status: 'Đã check-in',
        }
      )
      const newNotification = { content: "Lễ tân đã check-in phòng" };
                axios
                .post("https://server-j956.onrender.com/chats/send", newNotification)
                .then((response) => {
                console.log(response.data);
                })

  });
  navigate(`/saveHistory`, {
    state: {
        bookingId: id,
        note: `${user.role} ${user.fullname} đã check-in phòng`,
        user: user, // Truyền cả đối tượng người dùng
        path: "/rooms" // Thêm đường dẫn path
    }
});
    Promise.all(updates)
      .then(() => {
        // Refresh room data after updates
        axios.get('https://server-j956.onrender.com/rooms')
          .then((response) => setRoomData(response.data))
          .catch((error) => console.error('Error fetching updated room data:', error));

        // Clear selected rooms
        setSelectedRooms([]);
      })
      .catch((error) => console.error('Error updating rooms:', error));
  };

  return (
    <Container>
      <h2 className="text-center my-4">Chọn phòng sử dụng</h2>

      {/* Render room components with multi-select functionality */}
      {selectedLocation === '66f6c536285571f28087c16b' && (
        <DoSonRooms
          rooms={filteredRooms}
          onClick={handleRoomSelect}
          selectedRooms={selectedRooms}
          setSelectedRooms = {setSelectedRooms}
        />
      )}
      {selectedLocation === '66f6c59f285571f28087c16d' && (
        <CatBaRooms
          rooms={filteredRooms}
          onClick={handleRoomSelect}
          selectedRooms={selectedRooms}
          setSelectedRooms = {setSelectedRooms}
        />
      )}
      {selectedLocation === '66f6c5c9285571f28087c16a' && (
        <MinhKhaiRooms
          rooms={filteredRooms}
          onClick={handleRoomSelect}
          selectedRooms={selectedRooms}
          setSelectedRooms = {setSelectedRooms}
        />
      )}

      {/* Action buttons */}
      

      <div className="note mt-3">
        <button className="btn" style={{ backgroundColor: '#a8a8a8',marginRight:'10px' }}>Đang sử dụng</button>
        <button className="btn" style={{ backgroundColor: '#d3d3d3',marginRight:'10px' }}>Trống</button>
        <button className="btn" style={{ backgroundColor: '#d3d3d3',marginRight:'10px',border: '4px solid red' }}>Đã chọn</button>
      </div>
      <div className="mt-4">
        <Button
          variant="success"
          onClick={handleUpdateSelectedRooms}
          disabled={selectedRooms.length === 0}
        >
          Check - in
        </Button>
      </div>
    </Container>
  );
};

export default ListRoom;
