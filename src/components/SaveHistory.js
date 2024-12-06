import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const SaveHistory = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Lấy dữ liệu từ location.state
    const location = useLocation();
    const { bookingId, note, user, path } = location.state || {};

    // Ref để ngăn việc gọi nhiều lần
    const hasSaved = useRef(false);

    // Hàm lưu lịch sử
    const saveToHistory = async () => {
        if (hasSaved.current) return; // Ngăn gọi lại
        hasSaved.current = true;

        setLoading(true);
        setError(null);
        console.log('Saving history...');

        try {
            if (!user || !user._id) {
                throw new Error('User is not authenticated. Please log in again.');
            }

            // Fetch booking details
            const bookingResponse = await axios.get(`http://localhost:9999/bookings/${bookingId}`);
            const bookingData = bookingResponse.data;

            // Fetch related orderServices for the booking
            const orderServicesResponse = await axios.get(`http://localhost:9999/orderServices/booking/${bookingId}`);
            const orderServicesData = orderServicesResponse.data;

            // Prepare data to save in history
            const historyData = {
                bookingId,
                staffId: user._id, // Use the passed user ID
                old_info: {
                    booking: bookingData,
                    orderServices: orderServicesData
                },
                note: note || 'Updated booking and services',
            };

            // Send the data to history
            await axios.post('http://localhost:9999/histories', historyData);
            // vd luu bang be
            // await axios.post('http://localhost:9999/histories/BE', { bookingId: bookingId, staffId: user._id, note: "test BE" });

            // Navigate to the provided path
            if (path) {
                navigate(path);
            } else {
                throw new Error('Path is not provided for navigation.');
            }
        } catch (error) {
            console.error('Error saving history:', error);
            setError(error.message || 'Error saving history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (bookingId && !hasSaved.current) {
            saveToHistory();
        } else if (!bookingId) {
            setError('Booking ID is missing. Unable to save history.');
        }
    }, [bookingId]);

    return (
        <div>
            {loading ? (
                <p>Saving history...</p>
            ) : error ? (
                <p style={{ color: 'red' }}>{error}</p>
            ) : (
                <p>History saved for booking {bookingId}</p>
            )}
        </div>
    );
};

export default SaveHistory;
