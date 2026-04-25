import axios from 'axios';

const PROFILE_URL = 'http://localhost:8080/api/profile';

export const updateProfile = async (payload) => {
    const response = await axios.put(PROFILE_URL, payload, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    });

    return response.data;
};
