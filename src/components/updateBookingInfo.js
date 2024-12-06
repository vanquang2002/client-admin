import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Container, Form, Row, Col, Card, ListGroup } from 'react-bootstrap';
import axios from 'axios';
import SaveHistory from './SaveHistory';

const UpdateBookingInfo = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { selectedBookingDetails } = location.state || {};

    const [bookingDetails, setBookingDetails] = useState({
        price: selectedBookingDetails?.bookingId?.price || 0,
        contract: selectedBookingDetails?.bookingId?.contract || '',
        checkout: selectedBookingDetails?.bookingId?.checkout || '',
        quantity: selectedBookingDetails?.quantity || 0,
        checkin: selectedBookingDetails?.bookingId?.checkin || '',
    });

    const [orderRoomDetails, setOrderRoomDetails] = useState([]); // Mảng các orderRoom
    const [otherServices, setOtherServices] = useState([]);
    const [selectedService, setSelectedService] = useState('');
    const [serviceQuantity, setServiceQuantity] = useState(1);
    const [orderServicesData, setOrderServicesData] = useState([]); // Dịch vụ đã đặt trước đó
    const [addedServices, setAddedServices] = useState([]); // Dịch vụ mới được thêm
    const [user, setUser] = useState(null);

    // Lấy user từ localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userResponse = JSON.parse(storedUser);
            setUser(userResponse);
        }
    }, []);

    // Fetch danh sách dịch vụ và các thông tin khác
    useEffect(() => {
        axios.get('http://localhost:9999/otherServices')
            .then((response) => setOtherServices(response.data))
            .catch((error) => console.error('Error fetching services:', error));

        if (selectedBookingDetails) {
            // Lấy thông tin dịch vụ đã thêm trước đó
            axios.get(`http://localhost:9999/orderServices/booking/${selectedBookingDetails.bookingId._id}`)
                .then((response) => setOrderServicesData(response.data))
                .catch((error) => console.error('Error fetching added services:', error));

            // Lấy thông tin từ orderRoom theo bookingId
            axios.get(`http://localhost:9999/orderRooms/booking/${selectedBookingDetails.bookingId._id}`)
                .then((response) => setOrderRoomDetails(response.data)) // Lưu mảng orderRoom vào state
                .catch((error) => console.error('Error fetching order room details:', error));
        }
    }, [selectedBookingDetails]);

    // Cập nhật bookingDetails khi selectedBookingDetails thay đổi
    useEffect(() => {
        if (selectedBookingDetails) {
            setBookingDetails({
                price: selectedBookingDetails.bookingId.price,
                contract: selectedBookingDetails.bookingId.contract,
                checkout: selectedBookingDetails.bookingId.checkout,
                quantity: selectedBookingDetails.quantity,
                checkin: selectedBookingDetails.bookingId.checkin,
            });
        }
    }, [selectedBookingDetails]);

    // Xử lý thêm dịch vụ khác
    const handleAddService = () => {
        const serviceDetails = otherServices.find(s => s._id === selectedService);
        if (serviceDetails) {
            // Thêm dịch vụ mới vào mảng addedServices
            setAddedServices(prev => [
                ...prev,
                { otherServiceId: serviceDetails, quantity: parseInt(serviceQuantity) }
            ]);
            // Cập nhật giá tổng cộng (totalAmount)
            setBookingDetails(prevDetails => ({
                ...prevDetails,
                price: prevDetails.price + serviceDetails.price * parseInt(serviceQuantity),
            }));
        }

        setSelectedService("");
        setServiceQuantity(1);
    };

    // Hủy dịch vụ mới được thêm
    const handleRemoveAddedService = (index) => {
        const serviceToRemove = addedServices[index];

        // Trừ giá trị dịch vụ khỏi tổng giá
        setBookingDetails(prevDetails => ({
            ...prevDetails,
            price: prevDetails.price - serviceToRemove.otherServiceId.price * serviceToRemove.quantity,
        }));

        // Xóa dịch vụ khỏi mảng addedServices
        setAddedServices(prev => prev.filter((_, i) => i !== index));
    };

    // Xử lý submit thông tin đã cập nhật
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Prepare the updated booking data
            const updatedBooking = {
                ...selectedBookingDetails,
                bookingId: {
                    ...selectedBookingDetails.bookingId,
                    price: bookingDetails.price,
                    contract: bookingDetails.contract,
                    checkout: bookingDetails.checkout,
                },
            };

            // Update booking details
            await axios.put(`http://localhost:9999/bookings/${selectedBookingDetails.bookingId._id}`, updatedBooking.bookingId);

            // Add new services if any
            for (const service of addedServices) {
                await axios.post('http://localhost:9999/orderServices', {
                    otherServiceId: service.otherServiceId._id,
                    bookingId: selectedBookingDetails.bookingId._id,
                    quantity: service.quantity,
                    note: 'Some optional note'
                });
            }

            // After successful update, navigate to SaveHistory route with bookingId
            navigate(`/saveHistory`, {
                state: {
                    bookingId: selectedBookingDetails.bookingId._id,
                    note: `${user.role} ${user.fullname} đã update dữ liệu Booking`,
                    user: user // Pass user object as well
                }
            });


            console.log("Updated booking, logged history, and added services successfully");
        } catch (error) {
            console.error('Error updating booking:', error);
        }
    };




    return (
        <Container>
            {/* <SaveHistory bookingId={selectedBookingDetails.bookingId._id} note={""} /> */}
            <h2 className="my-4">Cập nhật thông tin đặt phòng</h2>
            {selectedBookingDetails ? (
                <Form onSubmit={handleSubmit}>
                    <h5>Thông tin khách hàng</h5>
                    <ListGroup className="mb-4">
                        <ListGroup.Item><strong>Tên Khách:</strong> {selectedBookingDetails.customerId?.fullname || 'Không có'}</ListGroup.Item>
                        <ListGroup.Item><strong>Điện thoại:</strong> {selectedBookingDetails.customerId?.phone || 'Không có'}</ListGroup.Item>
                        <ListGroup.Item><strong>Email:</strong> {selectedBookingDetails.customerId?.email || 'Không có'}</ListGroup.Item>
                        <ListGroup.Item><strong>Ngày sinh:</strong> {selectedBookingDetails.customerId?.dob || 'Không có'}</ListGroup.Item>
                        <ListGroup.Item><strong>Số người:</strong> {selectedBookingDetails.bookingId?.humans || 'Không có'}</ListGroup.Item>
                    </ListGroup>

                    <h5>Thông tin định danh</h5>
                    <ListGroup className="mb-4">
                        <ListGroup.Item><strong>Tên định danh:</strong> {selectedBookingDetails.identifyName || 'Không có'}</ListGroup.Item>
                        <ListGroup.Item><strong>Mã định danh:</strong> {selectedBookingDetails.identifyCode || 'Không có'}</ListGroup.Item>
                    </ListGroup>

                    <h5>Thông tin đặt phòng</h5>
                    {/* Lặp qua mảng orderRoomDetails để hiển thị từng phòng */}
                    {orderRoomDetails.length > 0 ? (
                        <Card className="mb-4">
                            <Card.Header>Thông tin các phòng đã đặt:</Card.Header>
                            <ListGroup variant="flush">
                                {orderRoomDetails.map((room, index) => (
                                    <ListGroup.Item key={index}>
                                        <Row>
                                            <Col><strong>Tên phòng:</strong> {room.roomCateId?.name || 'Không có'}</Col>
                                            <Col><strong>Số lượng phòng:</strong> {room.quantity}</Col>
                                            <Col><strong>Giá Phòng</strong> {room.roomCateId?.price || 0}</Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card>
                    ) : (
                        <p>Không có thông tin phòng.</p>
                    )}



                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="checkin" className="mb-3">
                                <Form.Label>Check-in</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="checkin"
                                    value={new Date(bookingDetails.checkin).toLocaleDateString()}
                                    readOnly
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="checkout" className="mb-3">
                                <Form.Label>Check-out</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="checkout"
                                    value={new Date(bookingDetails.checkout).toLocaleDateString()}
                                    readOnly
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group controlId="price" className="mb-3">
                                <Form.Label>Tổng Giá</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="price"
                                    value={bookingDetails.price}
                                    onChange={(e) => setBookingDetails({ ...bookingDetails, price: e.target.value })}
                                    readOnly={user?.role !== 'admin'}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="contract" className="mb-3">
                                <Form.Label>Hợp đồng</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="contract"
                                    value={bookingDetails.contract}
                                    onChange={(e) => setBookingDetails({ ...bookingDetails, contract: e.target.value })}
                                    readOnly={user?.role !== 'admin'}
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    
                    
                    {user?.role !== "admin" && (
                    <Row className="mt-3" >
                        <h5>Thêm Dịch Vụ Khác</h5>
                        <Col md={6}>
                            <Form.Group controlId="otherService">
                                <Form.Label>Chọn dịch vụ</Form.Label>
                                <Form.Select
                                    value={selectedService}
                                    onChange={(e) => setSelectedService(e.target.value)}
                                >
                                    <option value="">Chọn dịch vụ</option>
                                    {otherServices.map((service) => (
                                        <option key={service._id} value={service._id}>
                                            {service.name}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group controlId="serviceQuantity">
                                <Form.Label>Số lượng</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="1"
                                    value={serviceQuantity}
                                    onChange={(e) => setServiceQuantity(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Button variant="success" className="mt-4" onClick={handleAddService}>
                                Thêm dịch vụ
                            </Button>
                        </Col>
                    </Row>
                    )}
                    {/* Hiển thị danh sách dịch vụ đã thêm */}
                    {orderServicesData.length > 0 && (
                        <Card className="mt-4">
                            <Card.Header>Dịch vụ đã đặt:</Card.Header>
                            <ListGroup variant="flush">
                                {orderServicesData.map((service) => (
                                    <ListGroup.Item key={service._id}>
                                        <Row>
                                            <Col>{service.otherServiceId.name} - Số lượng: {service.quantity}</Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card>
                    )}

                    {/* Hiển thị dịch vụ mới được thêm */}
                    {addedServices.length > 0 && (
                        <Card className="mt-4">
                            <Card.Header>Dịch vụ mới thêm:</Card.Header>
                            <ListGroup variant="flush">
                                {addedServices.map((service, index) => (
                                    <ListGroup.Item key={index}>
                                        <Row>
                                            <Col>{service.otherServiceId.name} - Số lượng: {service.quantity}</Col>
                                            <Col md={3}>
                                                <Button variant="danger" onClick={() => handleRemoveAddedService(index)}>
                                                    Hủy
                                                </Button>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </Card>
                    )}

                    <Button variant="primary" type="submit" className="mt-4" style={{ marginRight: '10px' }}>
                        Cập nhật thông tin
                    </Button>
                    <Button variant="primary" type="submit" className="mt-4">
                        Yêu cầu hoàn tiền
                    </Button>
                </Form>
            ) : (
                <p>Không có thông tin để cập nhật.</p>
            )}
        </Container>
    );
};

export default UpdateBookingInfo;