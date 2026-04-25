import axios from 'axios';

const AUTH_URL = 'http://localhost:8080/auth';

export const createStaffAccount = async (payload) => {
    const response = await axios.post(`${AUTH_URL}/staff`, payload, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    return response.data;
};

export const getAdminOverview = async () => {
    const response = await axios.get('http://localhost:8080/api/admin/overview', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    return response.data;
};

export const getAllUsersForAdmin = async () => {
    const response = await axios.get('http://localhost:8080/api/admin/users', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    return response.data;
};

export const setUserAccountStatus = async (userId, active) => {
    const response = await axios.patch(
        `http://localhost:8080/api/admin/users/${userId}/status`,
        { active },
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }
    );

    return response.data;
};
