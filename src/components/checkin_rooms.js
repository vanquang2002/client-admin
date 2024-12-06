import React from 'react';
import { Card } from 'react-bootstrap';
import './listRoom.css';

// Room Component to display each room's basic info
const Room = ({ room, onClick, isSelected }) => {
  const roomCardStyle = {
    backgroundColor: 
      room.status === 'Trống' ? '#d3d3d3' : '#a8a8a8',
    width: 
      room.roomCategoryId._id === '670dbe2c5c9f636934a39e5d' ? '150px' : '70px',
    border: isSelected ? '4px solid red' : 'none',
  };

  return (
    <Card 
      style={roomCardStyle} 
      className="room-card" 
      onClick={() => onClick(room)} // Trigger onClick event to toggle selection
    >
      <p>{room.code}</p>
      <p>{room.roomCategoryId.name}</p>
    </Card>
  );
};

// Component for "Cơ sở Đồ Sơn" rooms
const DoSonRooms = ({ rooms, onClick, selectedRooms, setSelectedRooms }) => {
  const handleRoomClick = (room) => {
    setSelectedRooms((prevSelectedRooms) => {
      // Check if room is already selected
      if (prevSelectedRooms.includes(room._id)) {
        // If selected, remove it
        return prevSelectedRooms.filter((id) => id !== room._id);
      } else {
        // If not selected, add it
        return [...prevSelectedRooms, room._id];
      }
    });
    onClick(room); // Trigger the parent component to update `selectedRooms`
  };

  const floor7ds = rooms.slice(0, 15);
  const floor6ds = rooms.slice(15, 29);
  const floor5ds = rooms.slice(29, 41);
  const floor4ds = rooms.slice(41, 51);
  const floor3ds = rooms.slice(51, 57);

  return (
    <div className="room-layout">
      <h4>Cơ sở Đồ Sơn:</h4>
      <div className="room-row" style={{ marginLeft: '240px' }}>
        {floor3ds.map((room) => (
          <Room
            key={room._id}
            room={room}
            onClick={handleRoomClick}
            isSelected={selectedRooms.includes(room._id)}
          />
        ))}
      </div>
      <div className="room-row" style={{ marginLeft: '80px' }}>
        {floor4ds.map((room) => (
          <Room
            key={room._id}
            room={room}
            onClick={handleRoomClick}
            isSelected={selectedRooms.includes(room._id)}
          />
        ))}
      </div>
      <div className="room-row">
        {floor5ds.map((room) => (
          <Room
            key={room._id}
            room={room}
            onClick={handleRoomClick}
            isSelected={selectedRooms.includes(room._id)}
          />
        ))}
      </div>
      <div className="room-row">
        {floor6ds.map((room) => (
          <Room
            key={room._id}
            room={room}
            onClick={handleRoomClick}
            isSelected={selectedRooms.includes(room._id)}
          />
        ))}
      </div>
      <div className="room-row">
        {floor7ds.map((room) => (
          <Room
            key={room._id}
            room={room}
            onClick={handleRoomClick}
            isSelected={selectedRooms.includes(room._id)}
          />
        ))}
      </div>
    </div>
  );
};

const CatBaRooms = ({ rooms, onClick, selectedRooms, setSelectedRooms }) => {
  const handleRoomClick = (room) => {
    setSelectedRooms((prevSelectedRooms) => {
      // Check if room is already selected
      if (prevSelectedRooms.includes(room._id)) {
        // If selected, remove it
        return prevSelectedRooms.filter((id) => id !== room._id);
      } else {
        // If not selected, add it
        return [...prevSelectedRooms, room._id];
      }
    });
    onClick(room); // Trigger the parent component to update `selectedRooms`
  };

  const floor7cb = rooms.slice(0, 7);
  const floor6cb = rooms.slice(7, 14);
  const floor5cb = rooms.slice(14, 20);
  const floor4cb = rooms.slice(20, 26);
  const floor3cb = rooms.slice(26, 33);
  const floor2cb = rooms.slice(44, 40);


  return (
    <div className="room-layout">
    <h4>Cơ sở Cát Bà:</h4>
    <div className="room-row" style={{ marginLeft: '240px' }}>
      {floor2cb.map((room) => (
        <Room
        key={room._id}
        room={room}
        onClick={handleRoomClick}
        isSelected={selectedRooms.includes(room._id)}
      />
      ))}
    </div>
    <div className="room-row" style={{ marginLeft: '240px' }}>
      {floor3cb.map((room) => (
        <Room
        key={room._id}
        room={room}
        onClick={handleRoomClick}
        isSelected={selectedRooms.includes(room._id)}
      />
      ))}
    </div>
    <div className="room-row" style={{ marginLeft: '240px' }}>
      {floor4cb.map((room) => (
        <Room
        key={room._id}
        room={room}
        onClick={handleRoomClick}
        isSelected={selectedRooms.includes(room._id)}
      />
      ))}
    </div>
    <div className="room-row" style={{ marginLeft: '240px' }}>
      {floor5cb.map((room) => (
        <Room
        key={room._id}
        room={room}
        onClick={handleRoomClick}
        isSelected={selectedRooms.includes(room._id)}
      />
      ))}
    </div>
    <div className="room-row" style={{ marginLeft: '240px' }}>
      {floor6cb.map((room) => (
        <Room
        key={room._id}
        room={room}
        onClick={handleRoomClick}
        isSelected={selectedRooms.includes(room._id)}
      />
      ))}
    </div>
    <div className="room-row" style={{ marginLeft: '240px' }}>
      {floor7cb.map((room) => (
        <Room
        key={room._id}
        room={room}
        onClick={handleRoomClick}
        isSelected={selectedRooms.includes(room._id)}
      />
      ))}
    </div>
  </div>
);
};

const MinhKhaiRooms = ({ rooms, onClick, selectedRooms, setSelectedRooms }) => {
  const handleRoomClick = (room) => {
    setSelectedRooms((prevSelectedRooms) => {
      // Check if room is already selected
      if (prevSelectedRooms.includes(room._id)) {
        // If selected, remove it
        return prevSelectedRooms.filter((id) => id !== room._id);
      } else {
        // If not selected, add it
        return [...prevSelectedRooms, room._id];
      }
    });
    onClick(room); // Trigger the parent component to update `selectedRooms`
  };

  const floor7cb = rooms.slice(0, 11);
  const floor6cb = rooms.slice(11,22);
  const floor5cb = rooms.slice(22, 33);
  const floor4cb = rooms.slice(33, 43);
  const floor3cb = rooms.slice(43, 53);
  const floor2cb = rooms.slice(53, 63);

  return (
    <div className="room-layout">
      <h4>Cơ sở 16 Minh Khai:</h4>
      <div className="room-row" style={{ marginLeft: '240px' }}>
        {floor2cb.map((room) => (
          <Room
        key={room._id}
        room={room}
        onClick={handleRoomClick}
        isSelected={selectedRooms.includes(room._id)}
      />
        ))}
      </div>
      <div className="room-row" style={{ marginLeft: '240px' }}>
        {floor3cb.map((room) => (
          <Room
          key={room._id}
          room={room}
          onClick={handleRoomClick}
          isSelected={selectedRooms.includes(room._id)}
        />
        ))}
      </div>
      <div className="room-row" style={{ marginLeft: '240px' }}>
        {floor4cb.map((room) => (
          <Room
          key={room._id}
          room={room}
          onClick={handleRoomClick}
          isSelected={selectedRooms.includes(room._id)}
        />
        ))}
      </div>
      <div className="room-row" style={{ marginLeft: '240px' }}>
        {floor5cb.map((room) => (
          <Room
          key={room._id}
          room={room}
          onClick={handleRoomClick}
          isSelected={selectedRooms.includes(room._id)}
        />
        ))}
      </div>
      <div className="room-row" style={{ marginLeft: '240px' }}>
        {floor6cb.map((room) => (
          <Room
          key={room._id}
          room={room}
          onClick={handleRoomClick}
          isSelected={selectedRooms.includes(room._id)}
        />
        ))}
      </div>
      <div className="room-row" style={{ marginLeft: '240px' }}>
        {floor7cb.map((room) => (
          <Room
          key={room._id}
          room={room}
          onClick={handleRoomClick}
          isSelected={selectedRooms.includes(room._id)}
        />
        ))}
      </div>
    </div>
  );
};

export { DoSonRooms, CatBaRooms, MinhKhaiRooms };
