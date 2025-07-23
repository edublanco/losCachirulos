'use server'
import axios from 'axios';

const createCompletion = async (conversationId, prevMessages, newMessages, temperature) => {
  console.log(newMessages);
  try {
    const response = await axios.post(`http://localhost:8000/send_message`, {
      chatId: "112233",
      message: newMessages[0].content
    }, {
      headers: {
        'x-api-key': '',
      },
    });
    
    return response.data;
  } catch (err) {
    console.error('Error creating completion:', err);
    throw new Error(err?.response?.data?.error || err.message);
  }
}

export default createCompletion;