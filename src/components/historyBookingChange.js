import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Booking from "./bookingInfor.js";

const HistoryBookingChange = () => {
    const location = useLocation();
    const { bookingId } = location.state;
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedRow, setExpandedRow] = useState(null); // Trạng thái để theo dõi dòng đang mở rộng

    useEffect(() => {
        const fetchBookingHistory = async () => {
            try {
                const response = await axios.get(`http://localhost:9999/histories/booking/${bookingId}`);
                setHistory(response.data); // Giả sử API trả về một mảng lịch sử
            } catch (err) {
                setError('Lỗi khi tải lịch sử đặt phòng');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookingHistory();
    }, [bookingId]);

    const handleRowClick = (index) => {
        setExpandedRow(expandedRow === index ? null : index); // Toggle giữa mở và đóng dòng
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1 className="text-center">Lịch sử thay đổi thông tin đặt phòng</h1>
            {history.length > 0 ? (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Tên nhân viên</th>
                            <th>Ngày</th>
                            <th>Thay đổi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((change, index) => (
                            <React.Fragment key={index}>
                                <tr onClick={() => handleRowClick(index)}>
                                    <td>{change.staffId?.fullname || "Customer create"}</td>
                                    <td>{new Date(change.createdAt).toLocaleString()}</td>
                                    <td>{change.note}</td>
                                </tr>
                                {expandedRow === index && (
                                    <tr>
                                        <td colSpan="3">
                                            <div
                                                style={{
                                                    maxHeight: '300px', // Chiều cao tối đa cho phần thông tin cũ
                                                    overflowY: 'auto', // Cho phép cuộn theo chiều dọc
                                                    border: '1px solid #ccc',
                                                    padding: '10px',
                                                    backgroundColor: '#f9f9f9', // Màu nền để dễ nhìn
                                                }}
                                            >
                                                <h5>Thông tin:</h5>
                                                <Booking booking={change.old_info.booking} />
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </Table>
            ) : (
                <p>Không có lịch sử thay đổi nào.</p>
            )}
        </div>
    );
};

export default HistoryBookingChange;
