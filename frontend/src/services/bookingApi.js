import axios from 'axios';

const API_URL = 'http://localhost:8080/api/bookings';

export const createBooking = async (bookingData) => {
    const response = await axios.post(API_URL, bookingData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const getMyBookings = async () => {
    const response = await axios.get(`${API_URL}/my`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const updateBooking = async (id, bookingData) => {
    const response = await axios.put(`${API_URL}/${id}`, bookingData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const cancelBooking = async (id) => {
    await axios.post(`${API_URL}/${id}/cancel`, {}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
};

export const getAllBookings = async () => {
    const response = await axios.get(`${API_URL}/all`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const updateBookingStatus = async (id, status, rejectionReason = null) => {
    const params = { status };
    if (rejectionReason) params.rejectionReason = rejectionReason;
    await axios.patch(`${API_URL}/${id}/status`, null, {
        params,
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
};

export const getBookingSlots = async (resourceId, date) => {
    // date: 'YYYY-MM-DD'
    const response = await axios.get(`${API_URL}/slots`, {
        params: { resourceId, date },
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};
