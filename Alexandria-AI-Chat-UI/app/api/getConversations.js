'use server'
import axios from 'axios';

const URL = process.env.BACKEND_API;
const KEY = process.env.BACKEND_API_KEY;

const getConversations = async () => {
  try {
    const response = await axios.get(`${URL}/conversations`, {
      headers: {
        'x-api-key': KEY,
      },
    });
    return response.data.data;
  } catch (err) {
    throw new Error(err?.response?.data?.error || err.message);
  }
}

export default getConversations;