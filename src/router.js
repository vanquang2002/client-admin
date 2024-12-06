import UpdateBookingInfo from './components/updateBookingInfo';
import HistoryBookingChange from './components/historyBookingChange';
import SaveHistory from './components/SaveHistory';
import Login from './screens/Login/login';
import ChangePassword from './screens/Change Password/changepass';
import CreateBookingByStaff from './page/createBookingByStaff';
import ListRoom from './components/listRoom';
import ListStaff from './components/listStaff';
import Dashboard from './components/dashboard';
import ListRoomCate from './components/listRoomCate';
import ListBooking from './components/listBooking';
import reportWebVitals from './reportWebVitals';
import { Route, Routes, BrowserRouter as Router } from "react-router-dom";
import ListOtherServices from './components/listOtherServices';
import Checkin from './components/checkin';
import BookingDetails from './components/bookingDetails';
import ServiceBookingList from './components/servicebooking';

import BookingPage from './screens/pageBookingByStaff';
import UpdateAgencyOrder from './components/UpdateAgencyOrder';

function router() {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user.role;
  if (role === "admin") {
    return (

      <Routes>
        <Route path="/rooms" element={<ListRoom />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bookings" element={<ListBooking />} />
        <Route path="/staffs" element={<ListStaff />} />
        <Route path="/roomCate" element={<ListRoomCate />} />
        <Route path="/updateBookingInfo" element={<UpdateBookingInfo />} />
        <Route path="/historyBookingChange" element={<HistoryBookingChange />} />
        <Route path="/saveHistory" element={<SaveHistory />} />
        <Route path='/change-password' element={<ChangePassword />} />
        <Route path='/services' element={<ListOtherServices />} />
        <Route path="/bookings/:bookingId" element={<BookingDetails />} />
        <Route path='/servicesbooking' element={<ServiceBookingList />} />
      </Routes>
    );
  } else {
    if (role.includes("staff")) {
      return (
        <Routes>
          <Route path="/rooms" element={<ListRoom />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/bookings" element={<ListBooking />} />
          {/* <Route path="/createBooking" element={<CreateBookingByStaff />} /> */}
          <Route path="/bookingPage" element={<BookingPage />} />
          <Route path="/updateBookingInfo" element={<UpdateBookingInfo />} />
          <Route path="/saveHistory" element={<SaveHistory />} />
          <Route path='/change-password' element={<ChangePassword />} />
          <Route path='/checkin/:id' element={<Checkin />} />
          <Route path="/bookings/:bookingId" element={<BookingDetails />} />
          <Route path='/servicesbooking' element={<ServiceBookingList />} />
          {/* <Route path='/updateAgencyOrder' element={<UpdateAgencyOrder />} /> */}
        </Routes>
      );
    } else {
      return (
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
      );
    }
  }
}
export default router;