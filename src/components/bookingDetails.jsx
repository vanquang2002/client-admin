import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import "./bookingDetails.css";
import { Col, Container, Row, Button, Form, Card, Modal } from 'react-bootstrap';
import { format } from 'date-fns';
import AddServiceForm from './bookingRoom/addServiceForm';
import UpdateAgencyOrder from './UpdateAgencyOrder';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'; // Nhập useNavigate từ react-router-dom

// // Cấu hình react-toastify
// toast.configure();

const BookingDetails = () => {
    const { bookingId } = useParams();
    const [orderRooms, setOrderRooms] = useState([]);
    const [Rooms, setRooms] = useState([]);
    const [orderServices, setOrderServices] = useState([]);
    const [location, setLocation] = useState({});
    const [Agency, setAgency] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [expandedNotes, setExpandedNotes] = useState({}); // Trạng thái để lưu ghi chú được mở rộng
    const addServiceRef = useRef(null);
    const [newBookingPrice, setNewBookingPrice] = useState(0);
    const [updatePrice, setUpdatePrice] = useState(0);
    const [note, setNote] = useState(orderRooms[0]?.bookingId?.note || '');
    const roomCategoriesRef = useRef(null);
    const [updatedQuantities, setUpdatedQuantities] = useState({});
    const [staff, setStaff] = useState(null);
    const [contractCode, setContractCode] = useState(""); // State lưu mã hợp đồng
    const [price, setPrice] = useState(0); // State lưu giá cả
    const [showModal, setShowModal] = useState(false);


    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userResponse = JSON.parse(storedUser);
            setStaff(userResponse);
        }
    }, [])


    useEffect(() => {
        setNote(orderRooms[0]?.bookingId?.note || '');
    }, [orderRooms]);
    // Lấy thông tin đặt phòng
    const fetchBookingDetails = async () => {
        try {
            const [orderRoomsResponse, orderServiceResponse, roomsResponse] = await Promise.all([
                axios.get(`https://server-j956.onrender.com/orderRooms/booking/${bookingId}`),
                axios.get(`https://server-j956.onrender.com/orderServices/booking/${bookingId}`),
                axios.get(`https://server-j956.onrender.com/rooms/booking/${bookingId}`)
            ]);
            setOrderRooms(orderRoomsResponse.data);
            setOrderServices(orderServiceResponse.data);
            setRooms(roomsResponse.data.rooms);
        } catch (error) {
            console.error('Error fetching booking details:', error);
        }
    };

    // Lấy thông tin vị trí từ ID phòng
    const fetchLocationAndAgency = async (roomCateId, customerId) => {
        try {
            const locationsResponse = await axios.get(`https://server-j956.onrender.com/roomCategories/${roomCateId}`);
            setLocation(locationsResponse.data.locationId);
            const AgencyResponse = await axios.get(`https://server-j956.onrender.com/agencies/customer/${customerId}`);
            setAgency(AgencyResponse.data);
        } catch (error) {
            console.error('Error fetching location or agencies details:', error);
        }
    };


    // Gọi API khi trang được tải
    useEffect(() => {
        fetchBookingDetails();
    }, [bookingId]);

    // Cập nhật vị trí khi có thay đổi về phòng
    useEffect(() => {
        if (orderRooms.length > 0) {
            const { roomCateId, customerId } = orderRooms[0];
            if (roomCateId) {
                fetchLocationAndAgency(roomCateId._id, customerId._id);
            }
        }
    }, [orderRooms]);

    // Hàm xử lý khi click vào nút "Xem thêm"
    const toggleNote = (id) => {
        setExpandedNotes((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Hàm để hiển thị nội dung ghi chú
    const renderNote = (note, id) => {
        if (!note) return 'N/A';
        const isExpanded = expandedNotes[id];
        const shortNote = note.length > 100 ? `${note.substring(0, 100)}...` : note;
        return (
            <>
                {isExpanded ? note : shortNote}
                {note.length > 100 && (
                    <button
                        onClick={() => toggleNote(id)}
                        style={{
                            marginLeft: '10px',
                            background: 'none',
                            border: 'none',
                            color: '#007bff',
                            cursor: 'pointer',
                            textDecoration: 'underline',
                        }}
                    >
                        {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                    </button>
                )}
            </>
        );
    };
    // Handler for service total changes
    const handleServiceTotalChange = (total) => {
        setNewBookingPrice(total + orderRooms[0].bookingId?.price || 0);
    };

    // Hàm cập nhật thông tin dịch vụ và giá booking
    const handleUpdateBooking = async () => {
        setIsUpdating(true);
        try {
            const createService = await addServiceRef.current.addService(bookingId);
            if (createService) {
                const updatedBookingData = {
                    price: newBookingPrice || orderRooms[0].bookingId.price, // Cập nhật giá nếu có thay đổi
                };

                // Cập nhật giá booking và dịch vụ
                await axios.put(`https://server-j956.onrender.com/bookings/${bookingId}`, updatedBookingData);

                await axios.post('https://server-j956.onrender.com/histories/BE', { bookingId: bookingId, staffId: staff._id, note: `${staff.role} ${staff.fullname} đã thêm dịch vụ` });

                toast.success('Thông tin dịch vụ và giá đơn đã được cập nhật.', {
                    position: "top-right",
                });
                fetchBookingDetails(); // Tải lại thông tin booking sau khi cập nhật
            }
            else {
                toast.error('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.', {
                    position: "top-right",
                });
            }
        } catch (error) {
            console.error('Error updating booking data:', error);
            toast.error('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.', {
                position: "top-right",
            });
        } finally {
            setIsUpdating(false);
        }
    };


    // Xử lý check-out
    const handleCheckout = async () => {
        setIsUpdating(true);
        try {
            // const updatePay = await axios.put(`http://localhost:9999/payment/booking/${bookingId}`, { amount: orderRooms[0].bookingId.price, status: 'confirm' });
            // if (!updatePay.data.success) {
            //     const paymentResponse = await axios.post(`http://localhost:9999/payment/create-payment`, {
            //         amount: orderRooms[0].bookingId.price,
            //         bookingId: bookingId,
            //         status: 'confirm'
            //     });
            // }
            await axios.put(`https://server-j956.onrender.com/bookings/${bookingId}`, { status: 'Đã hoàn thành', payment: orderRooms[0].bookingId.price });

            for (const room of Rooms) {
                // Gửi yêu cầu PUT để cập nhật trạng thái
                await axios.put(`https://server-j956.onrender.com/rooms/${room._id}`, { status: 'Trống', bookingId: null });
                console.log(`Room ${room.code} updated to 'Trống'`);
            }
            console.log('Tất cả các phòng đã được cập nhật thành công!');
            // Cập nhật trạng thái booking
            setOrderRooms((prevOrderRooms) =>
                prevOrderRooms.map((orderRoom) => ({
                    ...orderRoom,
                    bookingId: { ...orderRoom.bookingId, status: 'Đã hoàn thành' },
                }))
            );

            const newNotification = { content: "Đơn phòng đã hoàn thành" };
            axios
                .post("http://localhost:9999/chats/send", newNotification)
                .then((response) => {
                    console.log(response.data);
                })

            await axios.post('https://server-j956.onrender.com/histories/BE', { bookingId: bookingId, staffId: staff._id, note: `${staff.role} ${staff.fullname} đã check out cho khách` });
            fetchBookingDetails()
            toast.success('Check out thành Công', {
                position: "top-right",
            });
            navigate('/bookings')
        } catch (error) {
            console.error('Error updating booking status:', error);
            toast.error('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.', {
                position: "top-right",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    if (orderRooms.length === 0) {
        return <div>Loading...</div>;
    }
    // Xử lý hủy
    const handleCancelService = async (deleteService, price) => {
        const checkinDate = new Date(deleteService?.time);
        const currentDate = new Date();
        const daysBeforeCheckin = Math.floor((checkinDate - currentDate) / (1000 * 3600 * 24));

        // Kiểm tra nếu dịch vụ được hủy trước ngày check-in 2 ngày
        if (daysBeforeCheckin >= 2) {
            if (window.confirm('Bạn có chắc muốn hủy dịch vụ này không?')) {
                // Xóa dịch vụ khỏi danh sách
                const updatedServices = orderServices.filter((service) => service._id !== deleteService._id);
                setOrderServices(updatedServices); // Cập nhật lại danh sách dịch vụ đã đặt

                // Cập nhật lại giá booking sau khi xóa dịch vụ
                setNewBookingPrice((prevPrice) => prevPrice - price);

                // Gửi yêu cầu xóa dịch vụ từ cơ sở dữ liệu
                try {
                    // Cập nhật lại booking với dịch vụ đã xóa
                    const updatedBookingData = {
                        price: orderRooms[0].bookingId.price - price || newBookingPrice,
                    };
                    await axios.put(`https://server-j956.onrender.com/bookings/${bookingId}`, updatedBookingData);
                    await axios.delete(`https://server-j956.onrender.com/orderServices/${deleteService._id}`);

                    await axios.post('https://server-j956.onrender.com/histories/BE', { bookingId: bookingId, staffId: staff._id, note: `${staff.role} ${staff.fullname} đã xóa dịch vụ` });

                    fetchBookingDetails(); // Tải lại thông tin booking sau khi cập nhật
                    toast.success('Dịch vụ đã được xóa thành công và giá đơn đã được cập nhật.', {
                        position: "top-right",
                    });

                } catch (error) {
                    console.error('Error canceling service:', error);
                    toast.error('Có lỗi xảy ra khi cập nhật thông tin. Vui lòng thử lại.', {
                        position: "top-right",
                    });
                }
            }
        } else {
            toast.error('Dịch vụ chỉ có thể hủy trước ngày sử dụng dịch vụ 2 ngày.', {
                position: "top-right",
            });
        }
    };
    const handleDeleteOrderRoom = async (OrderRoom) => {

        const checkinDate = new Date(OrderRoom.receiveRoom);
        const checkinBooking = new Date(OrderRoom.bookingId?.checkin);
        const checkoutDate = new Date(OrderRoom.returnRoom);
        const currentDate = new Date();
        const daysBeforeCheckin = Math.floor((checkinBooking - currentDate) / (1000 * 3600 * 24));
        const night = Math.floor((checkoutDate - checkinDate) / (1000 * 3600 * 24));

        const price = OrderRoom.roomCateId.price * OrderRoom.quantity * night;

        // Kiểm tra nếu phòng được hủy trước ngày check-in 2 ngày
        if (daysBeforeCheckin >= 2 && orderRooms.length > 1) {
            if (window.confirm('Bạn có chắc muốn hủy phòng này không?')) {
                // Xóa phòng khỏi danh sách
                const updatedRooms = orderRooms.filter((room) => room._id !== OrderRoom._id);
                setOrderRooms(updatedRooms); // Cập nhật lại danh sách phòng đã đặt

                // Cập nhật lại giá booking sau khi xóa phòng
                setNewBookingPrice((prevPrice) => prevPrice - price);

                // Gửi yêu cầu xóa phòng từ cơ sở dữ liệu
                try {
                    // Cập nhật lại booking với Room đã xóa
                    const updatedBookingData = {
                        price: OrderRoom.bookingId.price - price || newBookingPrice,
                    };
                    await axios.put(`https://server-j956.onrender.com/bookings/${bookingId}`, updatedBookingData);

                    // Gửi yêu cầu API để hủy phòng
                    await axios.delete(`https://server-j956.onrender.com/orderRooms/${OrderRoom._id}`)

                    await axios.post('https://server-j956.onrender.com/histories/BE', { bookingId: bookingId, staffId: staff._id, note: `${staff.role} ${staff.fullname} đã xóa phòng` });
                    fetchBookingDetails(); // Tải lại thông tin booking sau khi cập nhật
                    toast.success('Phòng  đã được xóa thành công và giá booking đã được cập nhật.', {
                        position: "top-right",
                    });

                } catch (error) {
                    console.error('Lỗi khi hủy phòng:', error);
                    toast.error('Không thể hủy phòng. Vui lòng thử lại.', {
                        position: "top-right",
                    });
                }
            };
        } else {
            if (orderRooms.length === 1) {
                toast.error('Phòng chỉ có thể xóa Khi còn trên 1 loại phòng.', {
                    position: "top-right",
                });
            }
            else {
                toast.error('Phòng chỉ có thể xóa trước ngày check in 2 ngày.', {
                    position: "top-right",
                });
            };
        }
    }


    const handleQuantityChange = (orderRoomId, quantity) => {
        setUpdatedQuantities((prev) => ({
            ...prev,
            [orderRoomId]: Math.max(1, Number(quantity)), // Đảm bảo số lượng tối thiểu là 1
        }));
    };

    const handleUpdateRoomAll = async () => {
        try {
            // Gọi hàm để tạo order rooms và nhận về tổng giá từ result
            const result = await roomCategoriesRef.current.createAgencyOrderRoom(orderRooms[0]?.bookingId?.price);

            if (result.success) {  // Cập nhật từng orderRoom với số lượng mới
                for (const [orderRoomId, quantity] of Object.entries(updatedQuantities)) {
                    await axios.put(`http://localhost:9999/orderRooms/${orderRoomId}`, { quantity });
                }
                // // Chờ tất cả các update hoàn thành
                // await Promise.all(updatePromises);

                // Tính tổng giá chênh lệch
                const priceDifference = calculateTotalPrice();

                // Cập nhật giá tổng của booking
                const bookingId = orderRooms[0]?.bookingId?._id;
                await axios.put(`https://server-j956.onrender.com/bookings/${bookingId}`, { price: orderRooms[0].bookingId.price + priceDifference + result.totalAmount, note: note });

                await axios.post('https://server-j956.onrender.com/histories/BE', { bookingId: bookingId, staffId: staff._id, note: `${staff.role} ${staff.fullname} đã cập nhật thông tin phòng` });


                // Làm mới dữ liệu
                fetchBookingDetails();

                // Reset số lượng đã cập nhật
                setUpdatedQuantities({});
                toast.success('Cập nhật số lượng phòng , ghi chú và giá thành công.', {
                    position: "top-right",
                });
            } else {
                toast.error('Có lỗi xảy ra. Vui lòng thử lại.', {
                    position: "top-right",
                });
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật:', error);
            toast.error('Có lỗi xảy ra. Vui lòng thử lại.', {
                position: "top-right",
            });

        }
    };



    const calculateTotalPrice = () => {
        // Lấy giá cũ của tất cả orderRooms (tính theo từng phòng)
        const oldPrice = orderRooms.reduce((total, orderRoom) => {
            const roomPrice = orderRoom.roomCateId?.price || 0;
            const quantity = orderRoom.quantity;

            const receiveDate = new Date(orderRoom.receiveRoom);
            const returnDate = new Date(orderRoom.returnRoom);
            const numberOfNights = Math.max(1, Math.ceil((returnDate - receiveDate) / (1000 * 60 * 60 * 24)));

            return total + roomPrice * quantity * numberOfNights;
        }, 0);

        // Tính giá mới từ số lượng phòng đã được cập nhật
        const newPrice = orderRooms.reduce((total, orderRoom) => {
            const roomPrice = orderRoom.roomCateId?.price || 0;
            const quantity = updatedQuantities[orderRoom._id] ?? orderRoom.quantity;

            const receiveDate = new Date(orderRoom.receiveRoom);
            const returnDate = new Date(orderRoom.returnRoom);
            const numberOfNights = Math.max(1, Math.ceil((returnDate - receiveDate) / (1000 * 60 * 60 * 24)));

            return total + roomPrice * quantity * numberOfNights;
        }, 0);

        // Tính chênh lệch giữa giá cũ và giá mới
        const priceDifference = newPrice - oldPrice;

        return priceDifference; // Trả về chênh lệch giá
    };

    const handleContractChange = (e) => setContractCode(e.target.value); // Xử lý thay đổi mã hợp đồng
    const handlePriceChange = (e) => setPrice(e.target.value); // Xử lý thay đổi giá cả


    const handleSave = async () => {
        try {
            // Cập nhật giá tổng của booking
            const bookingId = orderRooms[0]?.bookingId?._id;
            await axios.put(`http://localhost:9999/bookings/${bookingId}`, { price: price, contract: contractCode });
            await axios.post('http://localhost:9999/histories/BE', { bookingId: bookingId, staffId: staff._id, note: `${staff.role} ${staff.fullname} đã cập nhật thông tin ` });
            setContractCode(orderRooms[0]?.bookingId?.contract || '');
            setPrice(orderRooms[0]?.bookingId?.price || 0)
            fetchBookingDetails();
            toast.success('Cập nhật số mã hợp đồng và giá thành công.', {
                position: "top-right",
            });
        } catch (error) {
            console.log('Lỗi khi cập nhật:', error);
            toast.error('Có lỗi xảy ra. Vui lòng thử lại.', {
                position: "top-right",
            });
        }

    };


    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleConfirmCheckout = () => {
        setShowModal(false);
        handleCheckout(); // Thực hiện hành động Check-out
    };

    return (
        <div className="booking-details">
            <ToastContainer />
            <h2>Thông tin Đặt phòng</h2>
            <div>
                <h3>
                    Mã Đặt phòng: {orderRooms[0]?.bookingId?._id || "N/A"} - Mã hợp đồng:{" "}
                    {orderRooms[0]?.bookingId?.contract || "N/A"}
                </h3>

                {staff.role === 'admin' && <Form>
                    <Row className="mb-3">
                        {/* Input mã hợp đồng */}
                        <Form.Group as={Col} controlId="contractCode" className='d-flex justify-content-evenly align-content-center'>
                            <Form.Label className='align-content-center'><strong>Mã Hợp Đồng :</strong></Form.Label>
                            <Form.Control
                                className='w-75'
                                type="text"
                                placeholder="Nhập mã hợp đồng"
                                value={contractCode}
                                onChange={handleContractChange}
                            />
                        </Form.Group>

                        {/* Input giá cả */}
                        <Form.Group as={Col} controlId="price" className='d-flex justify-content-evenly align-content-center'>
                            <Form.Label className='align-content-center'><strong>Tổng giá :</strong></Form.Label>
                            <Form.Control
                                className='w-75'
                                type="number"
                                placeholder="Nhập giá cả"
                                value={price}
                                onChange={handlePriceChange}
                            />
                        </Form.Group>


                        {/* Nút lưu */}
                        <Col className=' align-content-center'>
                            <Button variant="primary" onClick={handleSave}>
                                Lưu
                            </Button>
                        </Col>

                    </Row>
                </Form>}
            </div>
            <Row className="customer-info">
                <h4>Thông tin Khách hàng</h4>
                <Col>
                    <p><strong>Họ và tên:</strong> {orderRooms[0].customerId?.fullname || 'N/A'}</p>
                    <p><strong>Email:</strong> {orderRooms[0].customerId?.email || 'N/A'}</p>
                    <p><strong>Số điện thoại:</strong> {orderRooms[0].customerId?.phone || 'N/A'}</p>
                    <p><strong>Check-in:</strong> {format(new Date(orderRooms[0].bookingId?.checkin), 'dd-MM-yyyy')}</p>
                    <p><strong>Check-out:</strong> {format(new Date(orderRooms[0].bookingId?.checkout), 'dd-MM-yyyy')}</p>
                </Col>
                {/* Hiển thị thông tin Agency */}
                {Agency && (
                    <Col className="agency-details">
                        <p><strong>Mã quân nhân:</strong> {Agency.code}</p>
                        <p><strong>Tên đơn vị:</strong> {Agency.name}</p>
                        <p><strong>SĐT đơn vị:</strong> {Agency.phone}</p>
                        <p><strong>Vị trí đơn vị:</strong> {Agency.address}</p>
                        <p><strong>Bank + STK:</strong> {Agency.stk}</p>
                    </Col>
                )}
                <Col>
                    <p><strong>Ngày tạo đơn:</strong> {format(new Date(orderRooms[0].createdAt), 'dd-MM-yyyy')}</p>
                    <p><strong>Tổng giá:</strong> {orderRooms[0].bookingId?.price ? `${orderRooms[0].bookingId.price} VND` : 0}</p>
                    <p><strong>Trạng thái:</strong> {orderRooms[0].bookingId?.status || 'N/A'}</p>
                    <p><strong>Đã thanh toán:</strong> {orderRooms[0].bookingId?.payment || 0}</p>
                    <p><strong>Còn nợ:</strong> {orderRooms[0].bookingId?.price - orderRooms[0].bookingId?.payment}</p>
                </Col>

            </Row>



            <section className="room-details">
                <h3>Thông tin Phòng </h3>
                <table>
                    <thead>
                        <tr>
                            <th>Tên phòng</th>
                            <th>Giá (VND)</th>
                            <th>Vị trí</th>
                            <th>Số lượng</th>
                            <th>Thời gian</th>
                            {Agency && orderRooms[0]?.bookingId?.status === 'Đã đặt' && <th>Thao tác</th>} {/* Chỉ hiển thị cột này nếu có Agency */}
                        </tr>
                    </thead>

                    <tbody>
                        {orderRooms.map((orderRoom) => (
                            <tr key={orderRoom._id}>
                                <td>{orderRoom.roomCateId?.name || 'N/A'}</td>
                                <td>{orderRoom.roomCateId?.price ? `${orderRoom.roomCateId.price} VND` : 'N/A'}</td>
                                <td>{location?.name || 'N/A'}</td>
                                <td>
                                    {Agency && orderRooms[0]?.bookingId?.status === 'Đã đặt' ? (
                                        <input
                                            type="number"
                                            min="1"
                                            value={updatedQuantities[orderRoom._id] ?? orderRoom.quantity}
                                            onChange={(e) => handleQuantityChange(orderRoom._id, e.target.value)}
                                        />
                                    ) : (
                                        orderRoom.quantity || 'N/A'
                                    )}
                                </td>
                                <td>
                                    {orderRoom?.receiveRoom
                                        ? format(new Date(orderRoom.receiveRoom), 'dd-MM-yyyy')
                                        : 'N/A'}{' '}
                                    {' => '}
                                    {orderRoom?.returnRoom
                                        ? format(new Date(orderRoom.returnRoom), 'dd-MM-yyyy')
                                        : 'N/A'}
                                </td>
                                {Agency && orderRooms[0]?.bookingId?.status === 'Đã đặt' && (
                                    <td>
                                        <button onClick={() => handleDeleteOrderRoom(orderRoom)}>Xóa</button>
                                    </td>
                                )}
                            </tr>
                        ))}

                    </tbody>
                </table>
                {/* <h3>Tổng giá: {calculateTotalPrice().toLocaleString()} VND</h3> */}

            </section>

            <section className="booking-info">
                <p><strong>Ghi chú:</strong> {renderNote(orderRooms[0].bookingId?.note) || 'N/A'}</p>
            </section>

            {orderRooms[0]?.bookingId?.status === 'Đã check-in' &&
                <Row>
                    {Rooms.map((room) => (
                        <Col md={2} key={room._id} >
                            <Card>
                                <Card.Body>
                                    <Card.Title>{room.roomCategoryId?.name || 'N/A'}</Card.Title>
                                    <Card.Text>
                                        <strong>Số phòng:</strong> {room?.code || 'N/A'}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>}

            {Agency && orderRooms[0]?.bookingId?.status === 'Đã đặt' &&
                <section>
                    <h3>Tạo mới</h3>
                    <UpdateAgencyOrder
                        ref={roomCategoriesRef}
                        customerID={orderRooms[0].customerId._id}
                        locationId={location._id}
                        bookingId={orderRooms[0].bookingId._id}
                        bookingPrice={orderRooms[0].bookingId.price}
                    />
                    {/* Note Input Field */}
                    <Row className="mb-3">
                        <Col>
                            <Form.Group controlId="note">
                                <Form.Label><strong>Ghi chú đặt phòng</strong></Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Nhập ghi chú (nếu có)"
                                    name="note"
                                    value={note} // Liên kết với state
                                    onChange={(e) => setNote(e.target.value)} // Cập nhật state
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    {/* Create Order Button */}
                    <Button
                        variant="primary"
                        onClick={handleUpdateRoomAll}
                    // disabled={totalPrice <= 0}
                    >
                        Thêm dữ liệu đặt phòng mới
                    </Button>
                </section>}




            <section className="service-details">
                <h3>Dịch vụ Đã đặt</h3>
                {orderServices.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Tên dịch vụ</th>
                                <th>Giá (VND)</th>
                                <th>Số lượng</th>
                                <th>Ngày sử dụng</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderServices.map((service) => (
                                <React.Fragment key={service._id}>
                                    <tr>
                                        <td>{service?.otherServiceId.name || "N/A"}</td>
                                        <td>{service.otherServiceId?.price || "N/A"}</td>
                                        <td>{service?.quantity || "N/A"}</td>
                                        <td>
                                            {(() => {
                                                const date = service.time;
                                                const formattedDate = date.replace('T', ',').split('.')[0]; // Loại bỏ phần milliseconds và thay T bằng ,
                                                const [datePart, timePart] = formattedDate.split(',');
                                                const [year, month, day] = datePart.split('-');
                                                return `${day}-${month}-${year}, ${timePart.slice(0, 5)}`; // Cắt giờ phút từ timePart
                                            })()}
                                        </td>

                                        <td>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleCancelService(service, (service.otherServiceId.price * service.quantity))}
                                            >
                                                Hủy Dịch Vụ
                                            </Button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="5">
                                            <strong>Ghi chú:</strong> {renderNote(service?.note, service._id)}
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <h3 className='text-success'>Khách hàng chưa đặt dịch vụ nào.</h3>
                )}
            </section>

            {/* Service Form */}
            {(orderRooms[0].bookingId?.status === 'Đã check-in' || orderRooms[0].bookingId?.status === 'Đã đặt') && (
                <div>
                    <AddServiceForm
                        ref={addServiceRef}
                        bookingId={bookingId} // Pass booking ID after it's created
                        onServiceTotalChange={handleServiceTotalChange} // Callback for service total
                        extrafee={true}
                    />
                    <Button onClick={handleUpdateBooking}
                        disabled={isUpdating || (orderRooms[0].bookingId?.status !== 'Đã check-in' && orderRooms[0].bookingId?.status !== 'Đã đặt')}

                    >
                        {isUpdating ? 'Đang cập nhật...' : 'Cập nhật Dịch vụ'}
                    </Button>
                </div>


            )}


            {/* <h3>Tổng giá tiền thay đổi thành: {newBookingPrice}</h3> */}
            <div className="checkout-button mt-4">


                {/* <button
                    onClick={handleCheckout}
                    disabled={isUpdating || orderRooms[0].bookingId?.status !== 'Đã check-in'}

                >
                    {isUpdating ? 'Đang cập nhật...' : 'Xác nhận Check-out'}
                </button> */}
                {/* Nút Check-out */}
                <Button
                    onClick={handleOpenModal}
                    disabled={isUpdating || orderRooms[0].bookingId?.status !== 'Đã check-in'}
                    variant="primary"
                >
                    {isUpdating ? 'Đang cập nhật...' : 'Xác nhận Check-out'}
                </Button>

                {/* Modal */}
                <Modal show={showModal} onHide={handleCloseModal} centered className="custom-modal">
                    <Modal.Header closeButton className="text-center">
                        <Modal.Title>Thông tin Check-out</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-center custom-modal-body">
                        <p><strong>Tổng giá:</strong> {orderRooms[0].bookingId?.price ? `${orderRooms[0].bookingId.price} VND` : 'N/A'}</p>
                        <p><strong>Đã thanh toán:</strong> {orderRooms[0].bookingId?.payment || 'N/A'} VND</p>
                        <p><strong>Còn nợ:</strong> {orderRooms[0].bookingId?.price - orderRooms[0].bookingId?.payment} VND</p>
                    </Modal.Body>
                    <Modal.Footer className="justify-content-center">
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Hủy bỏ
                        </Button>
                        <Button variant="primary" onClick={handleConfirmCheckout}>
                            Xác nhận Check-out
                        </Button>
                    </Modal.Footer>
                </Modal>
                {staff.role === 'admin' && (
                    <Button
                        variant="info"
                        style={{ margin: ' 0px 10px' }}
                        onClick={() => {
                            navigate('/historyBookingChange', { state: { bookingId: orderRooms[0].bookingId._id } }); // Chuyển hướng với bookingId
                        }}
                    >
                        Lịch sử
                    </Button>
                )}
            </div>
        </div>
    );
};
export default BookingDetails;
