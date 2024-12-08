import React, { useState, useEffect } from 'react';
import { Card, Container, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import 'react-datepicker/dist/react-datepicker.css';
import './dashboard.css';
import { format } from 'date-fns';

// Your existing component
const Dashboard = () => {
  const [orderData, setOrderData] = useState([]);
  const [userRole, setUserRole] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(''); // Trạng thái để lưu tháng được chọn
  const [message, setMessage] = useState("");


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
      .get('https://server-j956.onrender.com/orderRooms')
      .then((response) => setOrderData(response.data))
      .catch((error) => console.error('Error fetching order data:', error));



  }, []);
  const filteredOrderData = orderData.filter((order) => {
    const matchesLocation = selectedLocation ? order.roomCateId.locationId === selectedLocation : true;
    const matchesStatus = order.bookingId.status ? order.bookingId.status === 'Đã hoàn thành' : true;
    return matchesLocation && matchesStatus;
  });


  const bookings = filteredOrderData.map((order) => order.bookingId);
  const uniqueBookings = Array.from(new Set(bookings.map(booking => JSON.stringify(booking))))
    .map(item => JSON.parse(item));

  // Grouping and aggregating data
  const isValidDate = (date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime());
  };

  const aggregateDataByMonth = (data, year) => {
    const aggregated = data.reduce((acc, order) => {
      if (order.updatedAt && isValidDate(order.updatedAt)) {
        const updatedDate = new Date(order.updatedAt);
        if (updatedDate.getFullYear() === year) {
          const formattedMonth = format(updatedDate, 'MM/yyyy'); // Group by month

          if (!acc[formattedMonth]) {
            acc[formattedMonth] = {
              month: formattedMonth,
              quantity: 0,
              price: 0,
              humans: 0,
            };
          }

          acc[formattedMonth].quantity += order.quantity || 0;
          acc[formattedMonth].price += order.price || 0;
          acc[formattedMonth].humans += order.humans || 0;
        }
      }
      return acc;
    }, {});

    // Ensure all months are present
    for (let i = 0; i < 12; i++) {
      const month = format(new Date(year, i), 'MM/yyyy'); // Format as MM/yyyy
      if (!aggregated[month]) {
        aggregated[month] = {
          month,
          quantity: 0,
          price: 0,
          humans: 0,
        };
      }
    }

    return Object.values(aggregated).sort((a, b) => {
      const dateA = new Date(a.month.split('/').reverse().join('-'));
      const dateB = new Date(b.month.split('/').reverse().join('-'));
      return dateA - dateB; // Ascending order
    });
  };

  // Filter data and set the year
  const selectedYear = 2024; // Replace with dynamic year selection if needed
  const aggregatedOrderDataByMonth = aggregateDataByMonth(filteredOrderData, selectedYear);
  const aggregatedBookingsByMonth = aggregateDataByMonth(uniqueBookings, selectedYear);

  // Chart labels and data
  const monthLabels = aggregatedOrderDataByMonth.map((item) => item.month);
  const monthlyBookingsData = aggregatedOrderDataByMonth.map((item) => item.quantity);
  const monthlyRevenueData = aggregatedBookingsByMonth.map((item) => item.price);
  const monthlyHumansData = aggregatedBookingsByMonth.map((item) => item.humans);

  const bookingsChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Tổng số phòng',
        data: monthlyBookingsData,
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const revenueChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Tổng doanh thu',
        data: monthlyRevenueData,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  };

  const humansChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Tổng số khách hàng',
        data: monthlyHumansData,
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
      },
    ],
  };
  const aggregateDataByDay = (data, year) => {
    const aggregated = data.reduce((acc, order) => {
      if (order.updatedAt && isValidDate(order.updatedAt)) {
        const updatedDate = new Date(order.updatedAt);
        if (updatedDate.getFullYear() === year) {
          const formattedDate = format(updatedDate, 'dd/MM/yyyy'); // Group by day

          if (!acc[formattedDate]) {
            acc[formattedDate] = {
              date: formattedDate,
              quantity: 0,
              price: 0,
              humans: 0,
            };
          }

          acc[formattedDate].quantity += order.quantity || 0;
          acc[formattedDate].price += order.price || 0;
          acc[formattedDate].humans += order.humans || 0;
        }
      }
      return acc;
    }, {});

    return Object.values(aggregated).sort((a, b) => {
      const dateA = new Date(a.date.split('/').reverse().join('-')); // Convert 'dd/MM/yyyy' to 'yyyy-MM-dd'
      const dateB = new Date(b.date.split('/').reverse().join('-'));
      return dateA - dateB; // Ascending order
    });
  };

  const aggregatedOrderDataByDay = aggregateDataByDay(filteredOrderData, selectedYear);
  const aggregatedBookingsByDay = aggregateDataByDay(uniqueBookings, selectedYear);

  const aggregatedOrderDataByMonthWithDays = aggregatedOrderDataByDay.filter(item => {
    if (!selectedMonth) return true; // Hiển thị tất cả nếu không chọn tháng
    const [day, month, year] = item.date.split('/');
    return `${month}/${year}` === selectedMonth; // Lọc theo định dạng MM/yyyy
  });

  const aggregatedBookingsByMonthWithDays = aggregatedBookingsByDay.filter(item => {
    if (!selectedMonth) return true; // Hiển thị tất cả nếu không chọn tháng
    const [day, month, year] = item.date.split('/');
    return `${month}/${year}` === selectedMonth; // Lọc theo định dạng MM/yyyy
  });
  const dayLabels = aggregatedOrderDataByMonthWithDays.map((item) => item.date);
  const dailyBookingsData = aggregatedOrderDataByMonthWithDays.map((item) => item.quantity);
  const dailyRevenueData = aggregatedBookingsByMonthWithDays.map((item) => item.price);
  const dailyHumansData = aggregatedBookingsByMonthWithDays.map((item) => item.humans);
  console.log(dayLabels, dailyBookingsData, dailyRevenueData, dailyHumansData);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // const handleExport = async () => {
  //   try {
  //     const response = await axios.get("https://server-j956.onrender.com/orderRooms/excel");
  //     if (response.data.message) {
  //       console.log(response.data.message);
  //       setMessage(response.data.message);
  //     }
  //   } catch (error) {
  //     console.error("Error exporting Excel:", error);
  //     setMessage("Có lỗi xảy ra khi xuất file.");
  //   }
  // };
  const handleExport = async () => {
  try {
    // Gửi yêu cầu GET đến API, nhận dữ liệu dạng blob
    const response = await axios.get("https://server-j956.onrender.com/orderRooms/excel", {
      responseType: 'blob', // Quan trọng: nhận dữ liệu dạng blob
    });

    // Tạo file từ dữ liệu nhận được
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Lưu file sử dụng FileSaver.js hoặc cách thủ công
    const fileName = `Bao-cao-doanh-thu.xlsx`;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName); // Đặt tên file
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Thông báo thành công
    setMessage("Xuất file thành công!");
  } catch (error) {
    console.error("Error exporting Excel:", error);
    setMessage("Có lỗi xảy ra khi xuất file.");
  }
};

  
  return (
    <Container>
      <h2 className="text-center my-4">Bảng thống kê</h2>
      {userRole !== 'staff_ds' && userRole !== 'staff_cb' && userRole !== 'staff_mk' && (
        <Form.Group controlId="locationSelect">
          <Form.Label>Chọn địa điểm</Form.Label>
          <Form.Control
            as="select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">Tất cả địa điểm</option>
            <option value="66f6c5c9285571f28087c16a">Cơ sở Minh Khai</option>
            <option value="66f6c536285571f28087c16b">Cơ sở Đồ Sơn</option>
            <option value="66f6c59f285571f28087c16d">Cơ sở Cát Bà</option>
          </Form.Control>
        </Form.Group>
      )}

      <Row className="mt-4">
        <Col lg={4}>
          <Card className="chart">
            <h4 className="text-center">Tổng số phòng theo thời gian</h4>
            <Line data={bookingsChartData} />
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="chart">
            <h4 className="text-center">Tổng doanh thu theo thời gian</h4>
            <Line data={revenueChartData} />
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="chart">
            <h4 className="text-center">Tổng số khách hàng theo thời gian</h4>
            <Line data={humansChartData} />
          </Card>
        </Col>
      </Row>

      <Row className="mt-4">
        <Col>
          <Row>

            <h4 className="text-center">Dữ liệu hàng ngày<span>
              <button className="btn btn-primary mx-3" onClick={handleExport}>
                Xuất Excel
              </button>
            </span>
            </h4>

            {message && <Alert className="mt-2 text-success text-center">{message}</Alert>}
          </Row>

          <Form.Group controlId="monthSelect">
            <Form.Label>Chọn tháng</Form.Label>
            <Form.Control
              as="select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">Tất cả các tháng</option>
              {aggregatedOrderDataByMonth.map((item, index) => (
                <option key={index} value={item.month}>
                  {item.month} {/* Định dạng MM/yyyy */}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Tổng số phòng</th>
                <th>Tổng doanh thu</th>
                <th>Tổng số khách hàng</th>
              </tr>
            </thead>
            <tbody>

              {aggregatedOrderDataByMonthWithDays.map((item, index) => (
                <tr>
                  <td>{item.date}</td>
                  <td>{item.quantity}</td>
                  <td>{aggregatedBookingsByMonthWithDays[index].price}</td>
                  <td>{aggregatedBookingsByMonthWithDays[index].humans}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>

    </Container>
  );
};

export default Dashboard;
