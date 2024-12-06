// src/components/Sidebar.js
import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import './sideBar.css';
import { MdDashboard, MdBedroomParent, MdPeople, MdLogout, MdRoomService } from "react-icons/md";
import { RiBillFill } from "react-icons/ri";
import { BiSolidCategoryAlt } from "react-icons/bi";

const Sidebar = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user.role !== 'admin') {
    return (
      <div className="sidebar">
        <h2>Nhà khách <br />Hương Sen</h2>
        <Nav className="flex-column">
          <NavLink className="nav-link" to="/dashboard"><MdDashboard /> Thống kê</NavLink>
          <NavLink className="nav-link" exact to="/rooms"><MdBedroomParent /> Danh sách Phòng</NavLink>
          <NavLink className="nav-link" to="/bookings"><RiBillFill /> Danh sách Đặt phòng</NavLink>
          <NavLink className="nav-link" to="/servicesbooking"><MdRoomService /> Danh sách Đơn dịch vụ</NavLink>
          {/* <NavLink className="nav-link" to="/createBooking"><RiBillFill /> Đặt phòng</NavLink> */}
          <NavLink className="nav-link" to="/bookingPage"><RiBillFill /> Đặt phòng</NavLink>
          <NavLink className="nav-link" to="/"><MdLogout /> Đăng xuất</NavLink>
        </Nav>
      </div>
    )
  } else
    return (
      <div className="sidebar">
        <h2>Nhà khách <br />Hương Sen</h2>
        <Nav className="flex-column">
          <NavLink className="nav-link" to="/dashboard"><MdDashboard /> Thống kê</NavLink>
          <NavLink className="nav-link" exact to="/rooms"><MdBedroomParent /> Danh sách Phòng</NavLink>
          <NavLink className="nav-link" to="/roomCate"><BiSolidCategoryAlt /> Danh sách Loại phòng</NavLink>
          <NavLink className="nav-link" to="/bookings"><RiBillFill /> Danh sách Đặt phòng</NavLink>
          <NavLink className="nav-link" to="/servicesbooking"><MdRoomService /> Danh sách Đơn dịch vụ</NavLink>
          <NavLink className="nav-link" to="/services"><MdRoomService /> Danh sách Dịch vụ</NavLink>
          <NavLink className="nav-link" to="/staffs"><MdPeople></MdPeople> Danh sách Nhân viên</NavLink>
          <NavLink className="nav-link" to="/"><MdLogout /> Đăng xuất</NavLink>
        </Nav>
      </div>
    )
};

export default Sidebar;
