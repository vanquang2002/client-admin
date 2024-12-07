import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateBookingByStaff = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userResponse = JSON.parse(storedUser);
            setUser(userResponse);
        }
    }, []);

    const [bookingData, setBookingData] = useState({
        taxId: null,
        staffId: null,
        status: 'In Progress',
        payment: 'Chưa Thanh Toán',
        price: 0,
        checkin: today,
        checkout: tomorrow,
        note: '',
        humans: 1,
        contract: ''
    });

    useEffect(() => {
        if (user) {
            setBookingData((prevBookingData) => ({
                ...prevBookingData,
                staffId: user._id
            }));
        }
    }, [user]);

    const [customerData, setCustomerData] = useState({
        fullname: '',
        email: '',
        phone: '',
        dob: ''
    });

    const [identifycationData, setIdentifycationData] = useState({
        name: '',
        code: '',
        dateStart: '',
        dateEnd: '',
        location: '',
        customerID: null
    });

    const [errors, setErrors] = useState({});
    const [roomCategories, setRoomCategories] = useState([]);
    const [quantity, setQuantity] = useState({});
    const [totalAmount, setTotalAmount] = useState(0);
    const [totalRoomsByCategory, setTotalRoomsByCategory] = useState([]);
    const [remainingRooms, setRemainingRooms] = useState({});
    const [otherServices, setOtherServices] = useState([]);
    const [orderServicesData, setOrderServicesData] = useState([]);
    const [selectedService, setSelectedService] = useState("");
    const [serviceQuantity, setServiceQuantity] = useState(1);
    const [staffName, setStaffName] = useState('');

    useEffect(() => {
        const fetchRoomCategoriesLocationsOtherService = async () => {
            try {
                const roomCategoriesResponse = await axios.get('https://server-j956.onrender.com/roomCategories');
                let filteredRoomCategories = roomCategoriesResponse.data;
                const response = await axios.get('https://server-j956.onrender.com/otherServices');
                const services = response.data.map(service => ({
                    otherServiceId: service._id,
                    name: service.name,
                    price: service.price,
                    serviceQuantity: 0
                }));
                setOtherServices(services);

                if (user && user.role === 'staff_mk') {
                    filteredRoomCategories = filteredRoomCategories.filter(
                        (room) => room.locationId._id === '66f6c42f285571f28087c16a'
                    );
                } else if (user && user.role === 'staff_ds') {
                    filteredRoomCategories = filteredRoomCategories.filter(
                        (room) => room.locationId._id === '66f6c536285571f28087c16b'
                    );
                } else if (user && user.role === 'staff_cb') {
                    filteredRoomCategories = filteredRoomCategories.filter(
                        (room) => room.locationId._id === '66f6c59f285571f28087c16d'
                    );
                }
                setStaffName(user.fullname);
                setRoomCategories(filteredRoomCategories);

                const initialQuantity = {};
                filteredRoomCategories.forEach(room => {
                    initialQuantity[room._id] = 0;
                });
                setQuantity(initialQuantity);
            } catch (error) {
                console.error('Error fetching taxes or room categories:', error);
            }
        };

        if (user) {
            fetchRoomCategoriesLocationsOtherService();
        }
    }, [user]);

    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const totalRoomsResponse = await axios.get('https://server-j956.onrender.com/rooms/category/totals');
                setTotalRoomsByCategory(totalRoomsResponse.data.categoryTotals);

                const bookedRoomsResponse = await axios.get(`https://server-j956.onrender.com/orderRooms/totalbycategory/?checkInDate=${bookingData.checkin}&checkOutDate=${bookingData.checkout}`);
                const bookedRoomsMap = {};

                bookedRoomsResponse.data.forEach(item => {
                    bookedRoomsMap[item.roomCateId] = item.totalRooms;
                });

                const initialRemainingRooms = {};
                totalRoomsResponse.data.categoryTotals.forEach(room => {
                    const totalRooms = room.totalRooms;
                    const bookedRooms = bookedRoomsMap[room.roomCateId] || 0;
                    initialRemainingRooms[room.roomCateId] = totalRooms - bookedRooms;
                });

                setRemainingRooms(initialRemainingRooms);
            } catch (error) {
                console.error('Error fetching room data:', error);
            }
        };

        fetchRoomData();
    }, [bookingData.checkin, bookingData.checkout]);

    const handleChange = (e) => {
        setBookingData({
            ...bookingData,
            [e.target.name]: e.target.value
        });
    };

    const handleIdentifycationChange = (e) => {
        setIdentifycationData({
            ...identifycationData,
            [e.target.name]: e.target.value
        });
    };

    const handleQuantityChange = (e, roomId) => {
        const value = Math.max(0, Math.min(e.target.value, remainingRooms[roomId] || 0));
        setQuantity({
            ...quantity,
            [roomId]: value
        });
    };

    const handleAddService = () => {
        const existingService = orderServicesData.find(service => service.otherServiceId === selectedService);

        if (existingService) {
            setOrderServicesData(prevData =>
                prevData.map(service =>
                    service.otherServiceId === selectedService
                        ? { ...service, serviceQuantity: service.serviceQuantity + parseInt(serviceQuantity) }
                        : service
                )
            );
        } else {
            setOrderServicesData(prevData => [
                ...prevData,
                { otherServiceId: selectedService, serviceQuantity: parseInt(serviceQuantity) }
            ]);
        }

        setSelectedService("");
        setServiceQuantity(1);

        // Tính lại tổng tiền sau khi thêm dịch vụ
        calculateTotalAmount();
    };

    const handleRemoveService = (index) => {
        setOrderServicesData(prevData => prevData.filter((_, i) => i !== index));

        // Tính lại tổng tiền sau khi xóa dịch vụ
        calculateTotalAmount();
    };

    const handleCustomerChange = (e) => {
        setCustomerData({
            ...customerData,
            [e.target.name]: e.target.value
        });
    };

    // const calculateTotalAmount = () => {
    //     let total = 0;

    //     const checkinDate = new Date(bookingData.checkin);
    //     const checkoutDate = new Date(bookingData.checkout);
    //     const nights = (checkoutDate - checkinDate) / (1000 * 60 * 60 * 24);

    //     roomCategories.forEach((room) => {
    //         const qty = quantity[room._id] || 0;
    //         if (qty > 0) {
    //             total += room.price * qty * nights;
    //         }
    //     });

    //     setTotalAmount(total);
    // };
    const calculateTotalAmount = () => {
        let total = 0;

        const checkinDate = new Date(bookingData.checkin);
        const checkoutDate = new Date(bookingData.checkout);
        const nights = (checkoutDate - checkinDate) / (1000 * 60 * 60 * 24);

        // Calculate the total amount for room categories
        roomCategories.forEach((room) => {
            const qty = quantity[room._id] || 0;
            if (qty > 0) {
                total += room.price * qty * nights;
            }
        });

        // Calculate the total amount for selected services
        orderServicesData.forEach(service => {
            const serviceDetails = otherServices.find(s => s.otherServiceId === service.otherServiceId);
            if (serviceDetails) {
                total += serviceDetails.price * service.serviceQuantity;
            }
        });

        // Set the total amount
        setTotalAmount(total);

        // Update bookingData with the calculated total as price
        setBookingData(prevBookingData => ({
            ...prevBookingData,
            price: total // Store total amount as price in bookingData
        }));
    };



    useEffect(() => {
        calculateTotalAmount();
    }, [orderServicesData, quantity, bookingData.checkin, bookingData.checkout]);

    const validateForm = () => {
        const newErrors = {};
        const namePattern = /^[A-Za-zÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẰẮẲẴẶèéêẽếềệỉĩìíòóôõơợụùúỷỹýỵ\s]+$/;
        const today = new Date();

        if (!customerData.fullname.trim() || !namePattern.test(customerData.fullname)) {
            newErrors.fullname = "Họ và tên chỉ được chứa chữ cái";
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(customerData.email)) {
            newErrors.email = "Vui lòng nhập email hợp lệ";
        }

        const phonePattern = /^(03|05|07|08|09)\d{8,9}$/;
        if (!phonePattern.test(customerData.phone)) {
            newErrors.phone = "Vui lòng nhập số điện thoại hợp lệ";
        }

        const dob = new Date(customerData.dob);
        const age = today.getFullYear() - dob.getFullYear();
        if (age < 18 || (age === 18 && today < new Date(dob.setFullYear(today.getFullYear() - 18)))) {
            newErrors.dob = "Khách hàng phải từ 18 tuổi trở lên";
        }

        const checkinDate = new Date(bookingData.checkin);
        if (checkinDate < today.setHours(0, 0, 0, 0)) {
            newErrors.checkin = "Ngày check-in không thể là ngày trong quá khứ";
        }

        const checkoutDate = new Date(bookingData.checkout);
        if (checkoutDate <= checkinDate) {
            newErrors.checkout = "Ngày check-out phải sau ngày check-in ít nhất 1 ngày";
        }

        const selectedRooms = Object.values(quantity).some(qty => qty > 0);
        if (!selectedRooms) {
            newErrors.roomSelection = "Vui lòng chọn ít nhất một phòng với số lượng lớn hơn 0";
        }

        if (!identifycationData.name) {
            newErrors.name = "Loại giấy tờ định danh là bắt buộc";
        }

        const codePattern = /^[A-Za-z0-9]+$/;
        if (!identifycationData.code.trim() || !codePattern.test(identifycationData.code)) {
            newErrors.code = "Mã định danh chỉ được chứa chữ cái và số";
        }

        const identifycationStartDate = new Date(identifycationData.dateStart);
        const identifycationEndDate = new Date(identifycationData.dateEnd);
        if (!identifycationData.dateStart) {
            newErrors.dateStart = "Ngày cấp là bắt buộc";
        } else if (identifycationStartDate > today) {
            newErrors.dateStart = "Ngày cấp không thể sau ngày hôm nay";
        }

        if (!identifycationData.dateEnd) {
            newErrors.dateEnd = "Ngày hết hạn là bắt buộc";
        } else {
            const fiveYearsLater = new Date(identifycationStartDate);
            fiveYearsLater.setFullYear(fiveYearsLater.getFullYear() + 5);
            if (identifycationEndDate <= identifycationStartDate) {
                newErrors.dateEnd = "Ngày hết hạn phải sau ngày cấp";
            } else if (identifycationEndDate < fiveYearsLater) {
                newErrors.dateEnd = "Ngày hết hạn phải cách ngày cấp ít nhất 5 năm";
            }
        }

        const locationPattern = /^[A-Za-zÀ-ÿ0-9\s,.-]+$/;
        if (!identifycationData.location.trim() || !locationPattern.test(identifycationData.location)) {
            newErrors.location = "Địa chỉ chỉ được chứa chữ cái, số và các ký tự như ',', '.', và '-'";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            console.log("Form has errors, please fix them before submitting.");
            return;
        }

        try {
            const finalPrice = totalAmount;

            // First, update bookingData with the final price (totalAmount)
            setBookingData(prevBookingData => ({
                ...prevBookingData,
                price: finalPrice // Store totalAmount as price in bookingData
            }));
            console.log(bookingData)
            // Now send customer data to the server
            const formattedValue = customerData.fullname
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
            customerData.fullname = formattedValue;
            const customerResponse = await axios.post('https://server-j956.onrender.com/customers', customerData);
            const newCustomerId = customerResponse.data._id;

            // Create the updated booking after setting the price
            const bookingResponse = await axios.post('https://server-j956.onrender.com/bookings', {
                ...bookingData,
                price: finalPrice // Ensure the price is sent as part of the booking
            });

            const newBookingId = bookingResponse.data._id;

            // Send order rooms data to the server
            const orderRoomPromises = Object.entries(quantity).map(async ([roomCateId, qty]) => {
                if (qty > 0) {
                    return axios.post('http://localhost:9999/orderRooms', {
                        roomCateId,
                        customerId: newCustomerId,
                        bookingId: newBookingId,
                        quantity: qty
                    });
                }
            });

            // Send order services data to the server
            const orderServicePromises = orderServicesData.map(service => {
                if (service.serviceQuantity > 0) {
                    return axios.post('https://server-j956.onrender.com/orderServices', {
                        otherServiceId: service.otherServiceId,
                        bookingId: newBookingId,
                        quantity: service.serviceQuantity,
                        note: 'Some optional note'
                    });
                }
            });

            // Send identification data to the server
            await axios.post('https://server-j956.onrender.com/identifycations', {
                ...identifycationData,
                customerID: newCustomerId
            });

            await Promise.all([...orderRoomPromises, ...orderServicePromises]);

            // Prepare oldInfo object for history
            const orderRooms = Object.entries(quantity).map(([roomCateId, qty]) => {
                const room = roomCategories.find(r => r._id === roomCateId);
                return {
                    roomCateId,
                    roomName: room ? room.name : 'Unknown room',
                    quantity: qty
                };
            });

            // const oldInfo = {
            //     customer: customerData,
            //     orderRooms: orderRooms, // Including both room type and quantity
            //     booking: bookingData, // Booking data already includes the final price
            //     orderServices: orderServicesData,
            //     identifycation: identifycationData
            // };

            // // Create a history entry
            // await axios.post('http://localhost:9999/histories', {
            //     bookingId: newBookingId,
            //     staffId: bookingData.staffId, // Assuming staffId is available in bookingData
            //     old_info: oldInfo,
            //     note: `${user.role} ${staffName} đã tạo đặt phòng`
            // });
            navigate(`/saveHistory`, {
                state: {
                    bookingId: newBookingId,
                    note: `${user.role} ${staffName} đã tạo đặt phòng`,
                    user: user // Pass user object as well
                }
            });

            console.log('Booking, room orders, services, and history entry created successfully');
            // navigate('/bookings');

        } catch (error) {
            console.error('Error processing booking or room orders:', error);
        }
    };

    return (
        <Container className='mb-3'>
            <h6 className="my-4 px-2 text-bg-success d-inline ">Đặt Phòng Từ Nhân Viên: {staffName}</h6>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <h3 className='my-4'>Nhập Thông Tin Khách Hàng</h3>
                    <Col>
                        <Row className="mb-3">
                            <Col>
                                <Form.Group controlId="fullname">
                                    <Form.Label><strong>Họ và tên</strong></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="fullname"
                                        value={customerData.fullname}
                                        onChange={handleCustomerChange}
                                        isInvalid={!!errors.fullname}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.fullname}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="email">
                                    <Form.Label><strong>Email</strong></Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={customerData.email}
                                        onChange={handleCustomerChange}
                                        isInvalid={!!errors.email}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-3">
                            <Col>
                                <Form.Group controlId="phone">
                                    <Form.Label><strong>Số điện thoại</strong></Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="phone"
                                        value={customerData.phone}
                                        onChange={handleCustomerChange}
                                        isInvalid={!!errors.phone}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.phone}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group controlId="dob">
                                    <Form.Label><strong>Ngày tháng năm sinh</strong></Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="dob"
                                        value={customerData.dob}
                                        onChange={handleCustomerChange}
                                        isInvalid={!!errors.dob}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.dob}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Col>

                    <Col>
                        <Row>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label><strong>Loại giấy tờ định danh</strong></Form.Label>
                                    <Form.Select
                                        name='name'
                                        value={identifycationData.name}
                                        onChange={handleIdentifycationChange}
                                        isInvalid={!!errors.name}
                                    >
                                        <option value="">Chọn loại giấy tờ</option>
                                        <option value="Căn Cước Công Dân">Căn Cước Công Dân</option>
                                        <option value="Hộ Chiếu">Hộ Chiếu</option>
                                        <option value="Bằng Lái Xe">Bằng Lái Xe</option>
                                        <option value="Hộ khẩu">Hộ khẩu</option>
                                    </Form.Select>
                                    <Form.Control.Feedback type='invalid'>
                                        {errors.name}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className='mb-3'>
                                    <Form.Label><strong>Mã định danh</strong></Form.Label>
                                    <Form.Control
                                        type='text'
                                        placeholder='Nhập mã số của khách hàng'
                                        name='code'
                                        value={identifycationData.code}
                                        onChange={handleIdentifycationChange}
                                        isInvalid={!!errors.code}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        {errors.code}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={4}>
                                <Form.Group className='mb-3'>
                                    <Form.Label><strong>Ngày cấp</strong></Form.Label>
                                    <Form.Control
                                        type='date'
                                        name='dateStart'
                                        value={identifycationData.dateStart}
                                        onChange={handleIdentifycationChange}
                                        isInvalid={!!errors.dateStart}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        {errors.dateStart}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className='mb-3'>
                                    <Form.Label><strong>Hết hạn ngày</strong></Form.Label>
                                    <Form.Control
                                        type='date'
                                        name='dateEnd'
                                        value={identifycationData.dateEnd}
                                        onChange={handleIdentifycationChange}
                                        isInvalid={!!errors.dateEnd}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        {errors.dateEnd}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className='mb-3'>
                                    <Form.Label><strong>Địa chỉ</strong></Form.Label>
                                    <Form.Control
                                        type='text'
                                        placeholder='Nhập địa chỉ cấp'
                                        name='location'
                                        value={identifycationData.location}
                                        onChange={handleIdentifycationChange}
                                        isInvalid={!!errors.location}
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        {errors.location}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Col>
                </Row>

                <Row>
                    <Col style={{ marginLeft: "10px" }} className='col-7'>
                        <h3 className='mt-4 mb-4'>Chọn Loại Phòng & Số Lượng</h3>

                        <Row className="mb-3">
                            <Col md={3}>
                                <Form.Group controlId="checkin">
                                    <Form.Label className='mx-2'>
                                        <strong>Check-in Ngày: </strong>
                                    </Form.Label>
                                    <Form.Control
                                        className=' mx-2'
                                        type="date"
                                        name="checkin"
                                        value={bookingData.checkin}
                                        onChange={handleChange}
                                        isInvalid={!!errors.checkin}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.checkin}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group controlId="checkout">
                                    <Form.Label className='mx-2' >
                                        <strong>Check-out Ngày:</strong>
                                    </Form.Label>
                                    <Form.Control
                                        className='mx-2'
                                        type="date"
                                        name="checkout"
                                        value={bookingData.checkout}
                                        onChange={handleChange}
                                        isInvalid={!!errors.checkout}
                                        required
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.checkout}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className='mb-3'>
                                    <Form.Label><strong>Số lượng người</strong></Form.Label>
                                    <Form.Control
                                        type='number'
                                        placeholder='Enter number of people'
                                        name='humans'
                                        value={bookingData.humans}
                                        onChange={handleChange}
                                        isInvalid={!!errors.humans}
                                        min={1}
                                        required
                                    />
                                    <Form.Control.Feedback type='invalid'>
                                        {errors.humans}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

                        {roomCategories.map(room => {
                            const totalRoomData = totalRoomsByCategory.find(r => r.roomCateId === room._id);
                            const remainingRoomCount = remainingRooms[room._id] || 0;

                            return (
                                <Row key={room._id} className="mb-3">
                                    <Col className='col-7'>
                                        <Form.Label><strong>{room.name}</strong> - (Price: {room.price} VND)</Form.Label>
                                        <p>{room.locationId.name} <br /> <strong>Số phòng còn lại:</strong> {remainingRoomCount} / {totalRoomData ? totalRoomData.totalRooms : 0}</p>
                                    </Col>
                                    <Col className='col-2 d-flex align-items-center'>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            max={remainingRoomCount}
                                            value={quantity[room._id] || 0}
                                            onChange={(e) => handleQuantityChange(e, room._id)}
                                            required
                                        />
                                    </Col>
                                </Row>
                            );
                        })}
                        {errors.roomSelection && <p className="text-danger">{errors.roomSelection}</p>}
                    </Col>

                    {/* Dịch vụ */}
                    <Col>
                        <h3 className='mt-4 mb-4'>Dịch Vụ & Số lần Sử Dụng</h3>
                        <Form.Group>
                            <Form.Label>Chọn dịch vụ</Form.Label>
                            <Form.Select
                                value={selectedService}
                                onChange={(e) => setSelectedService(e.target.value)}
                            >
                                <option value="">Chọn dịch vụ</option>
                                {otherServices.map((service) => (
                                    <option key={service.otherServiceId} value={service.otherServiceId}>
                                        {service.name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Form.Group className='mt-3'>
                            <Form.Label>Nhập số lượng</Form.Label>
                            <Form.Control
                                type='number'
                                min='1'
                                value={serviceQuantity}
                                onChange={(e) => setServiceQuantity(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button className='mt-3' onClick={handleAddService} disabled={!selectedService || serviceQuantity <= 0}>
                            Thêm dịch vụ
                        </Button>

                        {/* Hiển thị danh sách các dịch vụ đã chọn */}
                        {orderServicesData.length > 0 && (
                            <div className="mt-3">
                                <h4>Dịch vụ đã chọn:</h4>
                                {orderServicesData.map((service, index) => {
                                    const serviceDetails = otherServices.find(s => s.otherServiceId === service.otherServiceId);
                                    return (
                                        <Row key={service.otherServiceId} className='mb-2'>
                                            <Col md={6}>{serviceDetails?.name} - Số lượng: {service.serviceQuantity}</Col>
                                            <Col md={3}>
                                                <Button variant="danger" onClick={() => handleRemoveService(index)}>Xóa</Button>
                                            </Col>
                                        </Row>
                                    );
                                })}
                            </div>
                        )}
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col>
                        <h5>Tổng tiền: {totalAmount}</h5>
                    </Col>
                </Row>

                <Button type="submit" variant="primary">Tạo đơn </Button>
            </Form>
        </Container>
    );
};

export default CreateBookingByStaff;
