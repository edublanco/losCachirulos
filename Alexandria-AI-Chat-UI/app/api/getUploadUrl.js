'use server'
import axios from 'axios';

const URL = process.env.BACKEND_API;
const KEY = process.env.BACKEND_API_KEY;

const getUploadUrl = async (fileType) => {
  try {
    const response = await axios.post(`${URL}/files`, {
      fileType,
    }, {
      headers: {
        'x-api-key': KEY,
      },
    });
    return response.data.data;
  } catch (err) {
    throw new Error(err?.response?.data?.error || err.message);
  }
}

export default getUploadUrl;