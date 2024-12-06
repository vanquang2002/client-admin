import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ListRoom from './components/listRoom';
import ListStaff from './components/listStaff';
import Dashboard from './components/dashboard';
import ListRoomCate from './components/listRoomCate';
import ListBooking from './components/listBooking';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container } from 'react-bootstrap';
import { BrowserRouter as Router, Routes, Route, useLocation, NavLink } from 'react-router-dom';
import Sidebar from './components/sideBar'; // Import the Sidebar component
import Login from './screens/Login/login';
import ChangePassword from './screens/Change Password/changepass';
import { RxAvatar } from "react-icons/rx";
import UpdateBookingInfo from './components/updateBookingInfo';
import HistoryBookingChange from './components/historyBookingChange';
import SaveHistory from './components/SaveHistory';
import App from './router';
import Header from './components/header';
// Layout wrapper to conditionally render sidebar and layout based on route
const Layout = ({ children }) => {
  const location = useLocation();

  // Check if the current path is "/login"
  const isLoginRoute = location.pathname === '/login';

  // If on the login route, render only the login content
  if (isLoginRoute) {
    return <>{children}</>;
  }

  // Otherwise, render the full layout with sidebar and content
  return (
    <div className="main-layout">
      <Sidebar /> {/* Sidebar is rendered only if not on the login route */}
      <Container fluid className="content" style={{ padding: '0px' }}>
        <div className="body">
          <Header />
          {children}
        </div>
      </Container>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <Test></Test> */}
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="*"
          element={(
            <Layout>
              <App />
            </Layout>
          )}
        />
      </Routes>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
