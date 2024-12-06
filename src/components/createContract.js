import React, { useState } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';

const ContractForm = ({ onSubmit }) => {
  const [contractId, setContractId] = useState('');
  const [clientName, setClientName] = useState('');
  const [contractDate, setContractDate] = useState('');
  const [duration, setDuration] = useState('');
  const [payment, setPayment] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const contractData = {
      contractId,
      clientName,
      contractDate,
      duration,
      payment,
      status
    };

    if (onSubmit) {
      onSubmit(contractData);
    }

    // Clear form fields after submission
    setContractId('');
    setClientName('');
    setContractDate('');
    setDuration('');
    setPayment('');
    setStatus('');
  };

  return (
    <Container>
      <h3 className="my-4">Nhập Thông Tin Hợp Đồng</h3>
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group controlId="formContractId" className="mb-3">
              <Form.Label>Mã Hợp Đồng</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập mã hợp đồng"
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formClientName" className="mb-3">
              <Form.Label>Tên Khách Hàng</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập tên khách hàng"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group controlId="formContractDate" className="mb-3">
              <Form.Label>Ngày Ký Hợp Đồng</Form.Label>
              <Form.Control
                type="date"
                value={contractDate}
                onChange={(e) => setContractDate(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formDuration" className="mb-3">
              <Form.Label>Thời Hạn Hợp Đồng (tháng)</Form.Label>
              <Form.Control
                type="number"
                placeholder="Nhập thời hạn hợp đồng"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group controlId="formPayment" className="mb-3">
              <Form.Label>Số Tiền Thanh Toán</Form.Label>
              <Form.Control
                type="number"
                placeholder="Nhập số tiền"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="formStatus" className="mb-3">
              <Form.Label>Trạng Thái</Form.Label>
              <Form.Control
                as="select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="">Chọn trạng thái</option>
                <option value="Pending">Đang chờ xử lý</option>
                <option value="Active">Đang hoạt động</option>
                <option value="Completed">Hoàn thành</option>
                <option value="Cancelled">Hủy</option>
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        <Button variant="primary" type="submit">
          Lưu Hợp Đồng
        </Button>
      </Form>
    </Container>
  );
};

export default ContractForm;
