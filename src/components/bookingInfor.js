import React from 'react';
import { Container, Row, Col, Card, ListGroup } from 'react-bootstrap';

const BookingInfo = ({ booking }) => {
  if (!booking) return <p>No booking data available.</p>;

  const {
    _id,
    checkin,
    checkout,
    note,
    payment,
    price,
    staffId,
    status,
    taxId,
    humans,
    createdAt,
    updatedAt,
    contract
  } = booking;

  return (
    <Container className="my-4">

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Mã Đặt Chỗ: {_id}</Card.Title>
          <Row>
            <Col md={6}>
              <ListGroup>
                <ListGroup.Item><strong>Ngày Check-in:</strong> {new Date(checkin).toLocaleDateString()}</ListGroup.Item>
                <ListGroup.Item><strong>Ngày Check-out:</strong> {new Date(checkout).toLocaleDateString()}</ListGroup.Item>
                <ListGroup.Item><strong>Ghi chú:</strong> {note}</ListGroup.Item>
                <ListGroup.Item><strong>Thanh toán:</strong> {payment}</ListGroup.Item>
                <ListGroup.Item><strong>Giá:</strong> {price.toLocaleString('vi-VN')} VND</ListGroup.Item>
                <ListGroup.Item><strong>Số người:</strong> {humans}</ListGroup.Item>
                <ListGroup.Item><strong>Trạng thái:</strong> {status}</ListGroup.Item>
                <ListGroup.Item><strong>Hợp đồng:</strong> {contract}</ListGroup.Item>
                <ListGroup.Item><strong>Ngày tạo:</strong> {new Date(createdAt).toLocaleString()}</ListGroup.Item>
                <ListGroup.Item><strong>Ngày cập nhật:</strong> {new Date(updatedAt).toLocaleString()}</ListGroup.Item>
              </ListGroup>
            </Col>

            <Col md={6}>
              <Card.Title>Thông Tin Nhân Viên</Card.Title>
              <ListGroup>
                <ListGroup.Item><strong>Họ và tên:</strong> {staffId?.fullname || "Customer create"}</ListGroup.Item>
                <ListGroup.Item><strong>Tên đăng nhập:</strong> {staffId?.username || "Customer create"}</ListGroup.Item>

              </ListGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>



    </Container>
  );
};

export default BookingInfo;
