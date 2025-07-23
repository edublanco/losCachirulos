'use server'
import axios from 'axios';

const createCompletion = async (conversationId, prevMessages, newMessages, temperature) => {
  /*
  try {
    const response = await axios.post(`${URL}/completions`, {
      conversationId,
      prevMessages,
      newMessages,
      temperature,
    }, {
      headers: {
        'x-api-key': KEY,
      },
    });
    return response.data.data;
  } catch (err) {
    throw new Error(err?.response?.data?.error || err.message);
  }
  */
  const getRandomString = (min, max) => {
    const length = Math.floor(Math.random() * (max - min + 1)) + min;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  const response = {
    conversation: "12345",
    result: {
      content: getRandomString(200,600)
    }
  };
  return response;
}

export default createCompletion;