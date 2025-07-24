'use server'
import axios from 'axios';

const createCompletion = async (conversationId, prevMessages, newMessages, temperature) => {

  try {
    const response = await axios.post(`http://localhost:8000/chroma-query`, null,{
      params:{
        query: newMessages[0].content
      }
    }, {
      headers: {
        'x-api-key': '',
      },
    });
    console.log(response);

    let resultString = response.data.answer;
    resultString += "\n\n";
    resultString += "INTERNAL DOCUMENTATION USED: " + response.data.used_documents[0];

    return resultString;
  } catch (err) {
    console.error('Error creating completion:', err);
    throw new Error(err?.response?.data?.error || err.message);
  }
}

export default createCompletion;