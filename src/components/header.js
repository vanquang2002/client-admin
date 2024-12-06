
import React, { useState, useEffect } from "react";
import { Navbar, Nav, Dropdown, ListGroup } from "react-bootstrap";
import { RxAvatar } from "react-icons/rx";
import { NavLink } from "react-router-dom";
import { MdNotificationsActive, MdNotifications } from "react-icons/md";
import './header.css';
// import { io } from "socket.io-client";
import axios from "axios";

// const socket = io("http://localhost:9999");
const Header = () => {
  const [newNoti, setNewNoti] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("http://localhost:9999/chats");
        if (response.ok) {
          const data = await response.json();
          if (data.length > notifications.length) {
              console.log('bcd');
              setNewNoti(true);
          }
          setNotifications(data);
          
        } else {
          console.error("Failed to fetch notifications");
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
      }
    };

    fetchNotifications();

    // socket.on("notification", (data) => {
    //     console.log("Nhận thông báo:", data);
  
    //     // Thêm thông báo mới vào state
    //     const updatedNotifications = [...notifications, data];
    //     setNotifications(updatedNotifications);
  
    //     // Lưu thông báo vào localStorage
    //     localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    //   });
  
    //   // Hủy kết nối khi component bị unmount
    //   return () => {
    //     socket.off("notification");
    //   };

      
  }, [notifications]);

 const sendNotification = () => {
    console.log('abc');
    const newNotification = { content: "New notification from React!" };
   axios
      .post("http://localhost:9999/chats/send", newNotification)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
    // socket.emit("send_notification", newNotification);
    
  };  

  const timeAgo = (inputTime) => { 
    if (!inputTime) return "Không có thời gian hợp lệ"; // Kiểm tra input

    const now = new Date();
    const inputDate = new Date(inputTime);

    if (isNaN(inputDate)) return "Thời gian không hợp lệ"; // Kiểm tra định dạng

    const diff = now - inputDate; // Chênh lệch tính bằng milliseconds

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (years > 0) return `${years} năm trước`;
    if (months > 0) return `${months} tháng trước`;
    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return `${seconds} giây trước`;
};
const handleDropdownToggle = () => {
    setNewNoti(false); // Set newNoti to false when dropdown is opened
  };
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Nav className="ml-auto">
      <Dropdown align="end" onToggle={handleDropdownToggle}>
          <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
            
          {newNoti ? (
                <MdNotificationsActive />
              ) : (
                <MdNotifications />
              )}
          </Dropdown.Toggle>
          <Dropdown.Menu style={{ width: "300px" }}>
            <Dropdown.Header>Thông báo</Dropdown.Header>
            <ListGroup variant="flush" style={{ maxHeight: "200px", overflowY: "auto" }}>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <ListGroup.Item key={index} action>
                    {timeAgo(notification.createdAt)}
                    {notification.content || "New notification"}
                  </ListGroup.Item>
                ))
              ) : (
                <div className="text-center py-3 text-muted">
                  No new notifications
                </div>
              )}
            </ListGroup>
            <Dropdown.Divider />
          </Dropdown.Menu>
        </Dropdown>
        {/* button test */}
        {/* <button onClick={sendNotification}>Send Notification</button> */}
        <NavLink className={"nav-link"} to="/change-password"><RxAvatar /> Thay đổi mật khẩu</NavLink>
      </Nav>
    </Navbar>
  );
};

export default Header;
