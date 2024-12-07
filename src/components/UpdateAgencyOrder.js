import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import axios from 'axios';
import { Form, Row, Col, Card, Button } from 'react-bootstrap';

const UpdateAgencyOrder = forwardRef(({ customerID, locationId, bookingId, bookingPrice }, ref) => {
    const [roomCategories, setRoomCategories] = useState([]);
    const [quantity, setQuantity] = useState({});
    const [remainingRooms, setRemainingRooms] = useState({});
    const [nights, setNights] = useState(1);
    const [selectedRooms, setSelectedRooms] = useState([]);
    const [roomPrices, setRoomPrices] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0);
    const [receiveRoom, setReceiveRoom] = useState(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00
        return today.toISOString().split('T')[0]; // Chuyển đổi về định dạng YYYY-MM-DD
    });

    const [returnRoom, setReturnRoom] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1); // Ngày mai
        tomorrow.setHours(0, 0, 0, 0); // Đặt thời gian về 00:00:00
        return tomorrow.toISOString().split('T')[0]; // Chuyển đổi về định dạng YYYY-MM-DD
    });

    const [receiveError, setReceiveError] = useState("");
    const [returnError, setReturnError] = useState("");
    const resetForm = () => {
        setQuantity({});
        setSelectedRooms([]);
        setRoomPrices(0);
        setTotalAmount(0);
        setReceiveRoom(new Date().toISOString().split('T')[0]); // Default: Today
        setReturnRoom(new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]); // Default: Tomorrow
    };

    // Fetch room data from backend
    const fetchRoomData = async () => {
        try {
            const roomCategoriesResponse = await axios.get('https://server-j956.onrender.com/roomCategories');
            const filteredRoomCategories = roomCategoriesResponse.data.filter(room => room.locationId._id === locationId);
            setRoomCategories(filteredRoomCategories);

            const bookedRoomsResponse = await axios.get(`https://server-j956.onrender.com/orderRooms/totalbycategory/?checkInDate=${receiveRoom}&checkOutDate=${returnRoom}`);
            const bookedRoomsMap = {};
            bookedRoomsResponse.data.forEach(item => {
                bookedRoomsMap[item.roomCateId] = item.totalRooms;
            });

            const totalRoomsResponse = await axios.get('https://server-j956.onrender.com/rooms/category/totals');
            const initialRemainingRooms = {};
            totalRoomsResponse.data.categoryTotals.forEach(room => {
                const totalRooms = room.totalRooms;
                const bookedRooms = bookedRoomsMap[room.roomCateId] || 0;
                initialRemainingRooms[room.roomCateId] = totalRooms - bookedRooms;
            });

            setRemainingRooms(initialRemainingRooms);
            return initialRemainingRooms; // Return the updated remaining rooms
        } catch (error) {
            console.error('Error fetching room data:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchRoomData();
    }, [receiveRoom, returnRoom, locationId]);


    // Calculate nights between check-in and check-out
    useEffect(() => {
        const checkinDate = new Date(receiveRoom);
        const checkoutDate = new Date(returnRoom);
        const diffTime = checkoutDate - checkinDate;
        const calculatedNights = diffTime / (1000 * 60 * 60 * 24);
        setNights(calculatedNights > 0 ? calculatedNights : 1);
    }, [receiveRoom, returnRoom]);

    // Handle room quantity changes
    const handleQuantityChange = (e, roomId) => {
        const value = Math.max(0, Math.min(e.target.value, remainingRooms[roomId] || 0));
        setQuantity({
            ...quantity,
            [roomId]: value
        });

        const room = roomCategories.find(room => room._id === roomId);
        const price = room.price * value * nights;

        setSelectedRooms(prevSelectedRooms => {
            const updatedRooms = [...prevSelectedRooms];
            const roomIndex = updatedRooms.findIndex(room => room.roomCateId === roomId);

            if (roomIndex >= 0) {
                if (value === 0) {
                    updatedRooms.splice(roomIndex, 1);
                } else {
                    updatedRooms[roomIndex].quantity = value;
                }
            } else if (value > 0) {
                updatedRooms.push({ roomCateId: roomId, quantity: value });
            }

            return updatedRooms;
        });


        handleRoomQuantityChange(roomId, value, price); // Update price for the selected room
    };



    useEffect(() => {
        // Cập nhật giá trị price cho tất cả các phòng khi nights thay đổi
        Object.keys(quantity).forEach(roomId => {
            const room = roomCategories.find(r => r._id === roomId);
            if (room) {
                const newPrice = room.price * quantity[roomId] * nights;
                handleRoomQuantityChange(roomId, quantity[roomId], newPrice);
            }
        });
    }, [nights]); // Chạy lại khi nights 


    const calculateTotalAmount = () => {
        let totalRoomAmount = Object.values(roomPrices).reduce((sum, price) => sum + price, 0);
        let total = totalRoomAmount;

        setTotalAmount(total);

    };

    useEffect(() => {
        calculateTotalAmount();
    }, [roomPrices, receiveRoom, returnRoom]);

    const handleRoomQuantityChange = (roomId, qty, price) => {
        setRoomPrices(prevPrices => ({
            ...prevPrices,
            [roomId]: price
        }));
    };
    // Handle the final creation of the order
    const createAgencyOrderRoom = async (bookingPrice1) => {
        try {
            const updatedRemainingRooms = await fetchRoomData(); // Fetch the latest data

            // Check for invalid room selections
            const invalidSelections = selectedRooms.filter(room => {
                const available = updatedRemainingRooms[room.roomCateId] || 0;
                return room.quantity > available;
            });

            if (invalidSelections.length > 0) {
                alert('Some room selections exceed the available number of rooms. Please adjust your selections.');
                let totalAmount = 0
                return { totalAmount, success: false };
            }

            if (receiveError !== '' || returnError) {

                let totalAmount = 0
                return { totalAmount, success: false };
            }
            // Create room orders
            const orderRoomPromises = selectedRooms.map(room => {
                return axios.post('https://server-j956.onrender.com/orderRooms', {
                    roomCateId: room.roomCateId,
                    customerId: customerID,
                    bookingId: bookingId,
                    quantity: room.quantity,
                    receiveRoom: receiveRoom,
                    returnRoom: returnRoom,
                });
            });
            const newNotification = { content: "Đơn đặt phòng của khách đoàn đã được cập nhật." };
            axios
                .post("https://server-j956.onrender.com/chats/send", newNotification)
                .then((response) => {
                    console.log(response.data);
                })
            await Promise.all(orderRoomPromises);
            // Reset form to default state
            resetForm();


            return { totalAmount, success: true };
        } catch (error) {
            console.error('Error creating order rooms:', error);

            return false;
        }
    };

    // Group rooms by location
    const groupedRooms = roomCategories.reduce((groups, room) => {
        const location = room.locationId?.name || 'Unknown Location';
        if (!groups[location]) {
            groups[location] = [];
        }
        groups[location].push(room);
        return groups;
    }, {});

    // Calculate total price
    const totalPrice = selectedRooms.reduce((sum, room) => {
        const roomDetails = roomCategories.find(r => r._id === room.roomCateId);
        return sum + roomDetails.price * room.quantity * nights;
    }, 0);


    useImperativeHandle(ref, () => ({
        createAgencyOrderRoom,
    }));

    const handleDateChange = (e, type) => {
        const newDate = new Date(e.target.value); // Create Date from input value
        newDate.setHours(0, 0, 0, 0); // Set time to 00:00:00

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set time to 00:00:00

        if (type === "receiveRoom") {
            const returnDate = new Date(receiveRoom);
            returnDate.setHours(0, 0, 0, 0); // Set time to 00:00:00
            const diffTime = returnDate - newDate;
            const calculatedNights = diffTime / (1000 * 60 * 60 * 24);
            if (!e.target.value) {
                setReceiveError("Ngày không được để trống!");
                setReceiveRoom(e.target.value);
            } else if (newDate < today) {
                setReceiveRoom(e.target.value);
                setReceiveError('Ngày không được chọn trong quá khứ!');
            } else if (calculatedNights < 1) {
                setReceiveRoom(e.target.value);
                setReturnError(''); // Clear error when valid
                setReceiveError('Ngày nhận phòng phải trước ngày trả phòng.');
            } else {
                setReceiveRoom(e.target.value);
                setReceiveError(''); // Clear error when valid
                setReturnError(''); // Clear error when valid

            }
        }

        if (type === "returnRoom") {
            const receiveDate = new Date(receiveRoom);
            receiveDate.setHours(0, 0, 0, 0); // Set time to 00:00:00

            const diffTime = newDate - receiveDate;
            const calculatedNights = diffTime / (1000 * 60 * 60 * 24);

            if (!e.target.value) {
                setReturnError("Ngày không được để trống!");
                setReturnRoom(e.target.value);
            } else if (newDate < today) {
                setReturnRoom(e.target.value);
                setReturnError('Ngày không được chọn trong quá khứ!');
            } else if (calculatedNights < 1) {
                setReturnError('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày.');
                setReturnRoom(e.target.value);
                setReceiveError(''); // Clear error when valid
            } else {
                setReturnRoom(e.target.value);
                setReturnError(''); // Clear error when valid
                setReceiveError(''); // Clear error when valid
            }
        }
    };



    return (
        <div>


            {/* Room Categories and Quantity Inputs */}
            {Object.keys(groupedRooms).map(location => (
                <Card key={location} className="mb-2">
                    <Card.Header>
                        <h5 className='text-center'>{location}</h5>
                    </Card.Header>

                    <Card.Body>
                        <Row className="mb-3">
                            <Col md={6}>
                                <Form.Group className='d-flex align-items-center justify-content-center '>
                                    <Form.Label><strong>Trả phòng :</strong></Form.Label>
                                    <Form.Control
                                        className='w-50 mx-2'
                                        type="date"
                                        value={receiveRoom}
                                        onChange={(e) => handleDateChange(e, "receiveRoom")}
                                    />
                                </Form.Group>
                                {receiveError && <div className="text-danger text-center">{receiveError}</div>}
                            </Col>

                            <Col md={6}>
                                <Form.Group className='d-flex align-items-center justify-content-center'>
                                    <Form.Label ><strong>Nhận phòng :</strong></Form.Label>
                                    <Form.Control
                                        className='w-50 mx-2'
                                        type="date"
                                        value={returnRoom}
                                        onChange={(e) => handleDateChange(e, "returnRoom")}
                                    />
                                </Form.Group>
                                {returnError && <div className="text-danger text-center mb-2">{returnError}</div>}
                            </Col>
                        </Row>
                        {groupedRooms[location].map((room, index) => { // Add index as fallback for key
                            const remainingRoomCount = remainingRooms[room._id] || 0;
                            const qty = quantity[room._id] || 0;
                            const totalRoomPrice = room.price * qty * nights;
                            return (
                                <Row key={room._id || index} className='border rounded-1 '>
                                    <Row className="my-2">
                                        <Col className='d-flex align-items-center justify-content-center'>
                                            <strong >{room.name}</strong>
                                        </Col>
                                        <Col className='d-flex align-items-center'>
                                            ( giá / 1đêm: {room.price} VND)
                                        </Col>
                                        <Col className="text-secondary d-flex align-items-center">
                                            Phòng còn trống: {remainingRoomCount}<br />
                                        </Col>
                                        <Col className="d-flex align-items-center">
                                            <Form.Control
                                                className='w-50'
                                                type="number"
                                                min="0"
                                                max={remainingRoomCount}
                                                value={qty}
                                                onChange={(e) => handleQuantityChange(e, room._id)}
                                                required
                                            />
                                        </Col>
                                        <Col className="text-secondary d-flex align-items-center">
                                            Tổng chi phí {qty} phòng: {totalRoomPrice} VND
                                        </Col>
                                    </Row>
                                </Row>
                            );
                        })}

                        {/* Total Price Display */}
                        <Row className='mt-2'>
                            <h5 className="d-flex align-items-center justify-content-center">Tổng giá Phòng thêm : {totalPrice} VND</h5>
                        </Row>
                    </Card.Body>
                </Card>
            ))}




        </div>
    );
});

export default UpdateAgencyOrder;
