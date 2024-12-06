import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

// Kết nối tới server
const socket = io("http://localhost:9999");

const App = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Khi component được render lần đầu, lấy thông báo từ localStorage
    const storedNotifications = JSON.parse(localStorage.getItem("notifications")) || [];
    setNotifications(storedNotifications);

    // Lắng nghe thông báo mới từ server
    socket.on("notification", (data) => {
      console.log("Nhận thông báo:", data);

      // Thêm thông báo mới vào state
      const updatedNotifications = [...notifications, data];
      setNotifications(updatedNotifications);

      // Lưu thông báo vào localStorage
      localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
    });

    // Hủy kết nối khi component bị unmount
    return () => {
      socket.off("notification");
    };
  }, [notifications]);
  const sendNotification = () => {
    console.log('abc');
    
    const newNotification = { message: "New notification from React!" };
    socket.emit("send_notification", newNotification);
  };

  return (
    <div>
      <h1>Real-Time Notifications</h1>
      <button onClick={sendNotification}>Send Notification</button>
      <ul>
        {notifications.map((notif, index) => (
          <li key={index}>{notif.message}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;

