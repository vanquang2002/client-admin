import React, { useState, useRef, useEffect } from 'react';
import AddUserForm from '../components/bookingRoom/addUserForm';
import AddIdentifyForm from '../components/bookingRoom/addIdentifyForm';
import { Col, Row, Button, Container } from 'react-bootstrap';
import AddBookingForm from '../components/bookingRoom/addBookingForm';
import AddServiceForm from '../components/bookingRoom/addServiceForm';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookingPage = () => {
    const [userId, setUserId] = useState(null); // To store the created user ID
    const [bookingId, setBookingId] = useState(null); // To store the created booking ID
    const userFormRef = useRef(null);           // Reference to the user form
    const identifyFormRef = useRef(null);       // Reference to the identification form
    const bookingFormRef = useRef(null);        // Reference to the booking form (optional for future use)
    const addServiceRef = useRef(null);         // Reference to the AddServiceForm
    const [staff, setStaff] = useState(null);
    const [locationId, setLocationId] = useState(null);
    const [serviceTotal, setServiceTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userResponse = JSON.parse(storedUser);
            setStaff(userResponse);
        }
    }, []);

    useEffect(() => {
        if (staff) {
            if (staff.role === 'staff_mk') {
                setLocationId('66f6c42f285571f28087c16a');
            } else if (staff.role === 'staff_ds') {
                setLocationId('66f6c536285571f28087c16b');
            } else if (staff.role === 'staff_cb') {
                setLocationId('66f6c59f285571f28087c16d');
            }
        }

    }, [staff]); // Only update locationId when staff changes

    // Handler for service total changes
    const handleServiceTotalChange = (total) => {
        setServiceTotal(total);
    };

    const handleCreateBoth = async () => {
        try {
            // 1. Tạo khách hàng
            const createdUserId = await userFormRef.current.createUser();
            if (createdUserId) {
                setUserId(createdUserId); // Lưu ID khách hàng
                console.log("Khách hàng đã được tạo với ID");

                // 2. Tạo giấy tờ tùy thân sau khi khách hàng được tạo
                const identifyCreated = await identifyFormRef.current.createIdentify(createdUserId);
                if (!identifyCreated) {
                    console.log('Tạo giấy tờ tùy thân thất bại.');
                    toast.error('Có lỗi xảy ra khi tạo giấy tờ tùy thân. Vui lòng thử lại.', {
                        position: "top-right",
                    });

                    return; // Dừng thực thi nếu tạo giấy tờ tùy thân thất bại
                }

                // 3. Tạo đặt phòng
                const createdBookingId = await bookingFormRef.current.createBooking();
                if (createdBookingId) {
                    setBookingId(createdBookingId); // Lưu ID đặt phòng

                    // 4. Thêm dịch vụ đã chọn vào orderService sau khi đặt phòng được tạo
                    await addServiceRef.current.addService(createdBookingId);
                    console.log('Đặt phòng và dịch vụ đã được tạo thành công!');
                    navigate(`/saveHistory`, {
                        state: {
                            bookingId: createdBookingId,
                            note: `${staff.role} ${staff.fullname} đã tạo đặt phòng`,
                            user: staff, // Truyền cả đối tượng người dùng
                            path: "/bookings" // Thêm đường dẫn path
                        }
                    });

                } else {
                    toast.error('Có lỗi xảy ra khi tạo đặt phòng hoặc dịch vụ. Vui lòng thử lại.', {
                        position: "top-right",
                    });
                    console.log('Đặt phòng và dịch vụ chưa được tạo.');
                }
            } else {
                toast.error('Có lỗi xảy ra khi tạo khách hàng. Vui lòng thử lại.', {
                    position: "top-right",
                });
                console.log('Tạo khách hàng thất bại.');
            }
        } catch (error) {
            console.error('Lỗi khi tạo khách hàng, giấy tờ tùy thân, hoặc đặt phòng:', error);
            toast.error('Có lỗi xảy ra trong quá trình tạo. Vui lòng thử lại.', {
                position: "top-right",
            });
        }
    };



    return (
        <Container>
            <ToastContainer />
            <h6 className="my-4 px-2 text-bg-success d-inline ">Đặt Phòng Từ Nhân Viên: {staff?.fullname || "chưa Login"}</h6>
            <Row>
                <Col md="6">
                    {/* User Form */}
                    <AddUserForm ref={userFormRef} />


                    {/* Service Form */}
                    <AddServiceForm
                        ref={addServiceRef}
                        bookingId={bookingId} // Pass booking ID after it's created
                        onServiceTotalChange={handleServiceTotalChange} // Callback for service total
                        extrafee={false}
                    />
                </Col>

                <Col>
                    {/* Identification Form */}
                    <AddIdentifyForm ref={identifyFormRef} />
                    {/* Booking Form */}
                    <AddBookingForm
                        ref={bookingFormRef}
                        onBookingCreated={setBookingId}
                        customerID={userId}
                        serviceAmount={serviceTotal}
                        locationId={locationId}
                        staff={staff} // Pass locationId here
                    />
                    <Button className='text-bg-success fs-3' onClick={handleCreateBoth}>
                        Đặt Phòng Ngay
                    </Button>
                </Col>
            </Row>
        </Container>
    );
};

export default BookingPage;
