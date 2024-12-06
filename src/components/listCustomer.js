import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';

// Component Customer để hiển thị thông tin từng khách hàng
const Customer = ({ customer, onDeactive }) => {
  return (
    <tr>
      <td>{customer.username}</td>
      <td>{customer.fullname}</td>
      <td>{customer.email}</td>
      <td>{customer.phone}</td>
      <td>{customer.address}</td>
      <td>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDeactive(customer)}
          disabled={customer.deactive} // Vô hiệu hóa nút nếu khách hàng đã bị deactive
        >
          {customer.deactive ? 'Deactivated' : 'Deactive'}
        </Button>
      </td>
    </tr>
  );
};

// Component ListCustomer để quản lý danh sách khách hàng
const ListCustomer = () => {
  const [customerData, setCustomerData] = useState([]);
  const [searchName, setSearchName] = useState(''); // Tìm kiếm theo tên khách hàng
  const [searchEmail, setSearchEmail] = useState(''); // Tìm kiếm theo email

  // Lấy dữ liệu từ API
  useEffect(() => {
    axios
      .get('http://localhost:9999/customers')
      .then((response) => setCustomerData(response.data))
      .catch((error) => console.error("Error fetching customer data:", error));
  }, []);

  // Hàm cập nhật trạng thái "Deactive" của khách hàng
  const handleDeactive = (customer) => {
    customer.deactive = true
    const id = customer._id;
    console.log(customer);
    
    axios
      .put(`http://localhost:9999/customers/${id}`,customer ) // Cập nhật trạng thái deactive thành true
      .then(() => {
        // Cập nhật lại trạng thái trong danh sách
        setCustomerData(
          customerData.map((customer) =>
            customer.id === id ? { ...customer, deactive: true } : customer
          )
        );
      })
      .catch((error) => console.error("Error updating customer:", error));
  };

  // Lọc danh sách khách hàng theo tên và email
  const filteredCustomerData = customerData.filter((customer) => {
    return (
      customer.fullname.toLowerCase().includes(searchName.toLowerCase()) &&
      customer.email.toLowerCase().includes(searchEmail.toLowerCase())
    );
  });

  return (
    <Container>
      <h2 className="text-center my-4">Danh sách khách hàng</h2>

      {/* Ô tìm kiếm */}
      <Row className="mb-3">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Tìm theo tên khách hàng"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </Col>
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Tìm theo email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
        </Col>
      </Row>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Username</th>
            <th>Tên khách hàng</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Địa chỉ</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomerData.map((customer) => (
            <Customer key={customer.id} customer={customer} onDeactive={handleDeactive} />
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ListCustomer;
