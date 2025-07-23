const uploadFile = async (url, file) => {
  try {
    await fetch(url, {
      method: 'PUT',
      body: file,
    });
    return;
  } catch (err) {
    console.log('ERR UPLOAD FILE', err);
    throw new Error('Error subiendo la foto a S3');
  }
} 

export default uploadFile;