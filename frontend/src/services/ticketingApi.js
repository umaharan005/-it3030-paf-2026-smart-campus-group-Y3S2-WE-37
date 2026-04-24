import axios from 'axios';

const API_URL = 'http://localhost:8080/api/tickets';

export const createTicket = async (ticketData) => {
    const response = await axios.post(API_URL, ticketData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const getMyTickets = async () => {
    const response = await axios.get(`${API_URL}/my`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const getTicketById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const addComment = async (id, commentData) => {
    const response = await axios.post(`${API_URL}/${id}/comments`, commentData, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const updateTicketStatus = async (id, status) => {
    const response = await axios.patch(`${API_URL}/${id}/status`, null, {
        params: { status },
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const assignTicket = async (id, technicianEmail) => {
    const response = await axios.patch(`${API_URL}/${id}/assign`, null, {
        params: { technicianEmail },
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const getAllTickets = async () => {
    const response = await axios.get(API_URL, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};

export const getAssignedTickets = async () => {
    const response = await axios.get(`${API_URL}/assigned`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });
    return response.data;
};
