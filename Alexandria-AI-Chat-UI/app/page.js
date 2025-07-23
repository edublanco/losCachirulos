'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import {
  TextField,
  Button,
  Box,
  Typography,
  List,
  ListItem,
  Slider,
  Stack,
  Paper,
  Switch,
  IconButton,
  Tooltip,
  Collapse,
  InputAdornment,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DeleteIcon from '@mui/icons-material/Delete';
import SendIcon from '@mui/icons-material/Send';
import Loading from './components/Loading';
import { useSnackbar } from 'notistack';

import createCompletion from './api/createCompletion';
import getConversation from './api/getConversation';
import getUploadUrl from './api/getUploadUrl';
import uploadFile from './api/uploadFile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6c757d',
    },
    background: {
      default: '#1b1b1b',
      paper: '#1D1F2B',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#a0a0a0',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h6: {
      fontWeight: 600,
      fontSize: '1.2rem',
      color: '#e0e0e0',
    },
    body1: {
      fontSize: '1rem',
      color: '#e0e0e0',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.1em',
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: '#252837',
          },
          '& .MuiInputLabel-root': {
            color: '#a0a0a0',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '20px',
          backgroundColor: '#2c2c2c',
        },
      },
    },
  },
});

const Playground = () => {
  const params = useParams();
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [conversationId, setConversationId] = useState('');
  const [systemMessage, setSystemMessage] = useState('');
  const [prevSystemMessage, setPrevSystemMessage] = useState('');
  const [userMessage, setUserMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [temperature, setTemperature] = useState(1);
  const [persistConversation, setPersistConversation] = useState(false);
  const [generalFile, setGeneralFile] = useState(null);
  const [fileDetail, setFileDetail] = useState('auto');
  const [systemMessageCollapsed, setSystemMessageCollapsed] = useState(false);
  const messageListRef = useRef(null);

  useEffect(() => {
    if (params.id) {
      handleGetConversation();
    }
  }, []);

  // Scroll to the bottom when a new message is added
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleGetConversation = async () => {
    try {
      setLoading(true);
      const response = await getConversation(params.id);
      let index = -1;
      const completions = response.completions.map((item, i) => {
        if (item.role === 'system') {
          index = i;
        }
        return {
          role: item.role,
          content: item.content,
          fileUrl: item.fileUrl,
        };
      });
      if (index > -1) {
        setPrevSystemMessage(completions[index].content);
        setSystemMessage(completions[index].content);
      }
      setMessages(completions);
      setConversationId(params.id);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async () => {
    try {
      setCompletionLoading(true);

      const prevMessages = [...messages];
      const newMessages = [];
      if (systemMessage !== prevSystemMessage) {
        if (userMessage === '' && systemMessage === '') {
          enqueueSnackbar('System and User messages must not be empty at the same type', { variant: 'warning' });
          return;
        }
        newMessages.push({ role: 'system', content: systemMessage });
        newMessages.push({ role: 'user', content: userMessage });
        setPrevSystemMessage(systemMessage);
      } else {
        if (userMessage === '') {
          enqueueSnackbar('User Message must not be empty', { variant: 'warning' });
          return;
        }
        newMessages.push({ role: 'user', content: userMessage });
      }

      if (generalFile) {
        newMessages.pop();

        const nu = URL.createObjectURL(generalFile);
        const res = await fetch(nu);
        const blob = await res.blob();
        const fileType = generalFile.type.split('/')[1];

        const uploadUrlRes = await getUploadUrl(fileType);
        await uploadFile(uploadUrlRes.uploadURL, blob);

        newMessages.push({
          role: 'user',
          content: [
            { type: 'text', text: userMessage },
            {
              type: 'image_url',
              image_url: {
                'url': uploadUrlRes.fileUrl,
                'detail': fileDetail,
              },
            },
          ],
        });
      }

      const response = await createCompletion(conversationId, prevMessages, newMessages, temperature);
      const newConvId = response.responseChatId;
      const reply = response.responseMessage;

      newMessages.push({ role: 'assistant', content: reply });
      setMessages([...prevMessages, ...newMessages]);
      setConversationId(newConvId);
    } catch (err) {
      console.error('Error creating completion1:', err);
      enqueueSnackbar(err.message, { variant: 'error' });
    } finally {
      setCompletionLoading(false);
      setUserMessage('');
      setGeneralFile(null);
    }
  };

  const handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault(); // Prevent new line
      handleSubmit();
    }
  };

  const renderSystemMessagePreview = () => {
    if (systemMessage.length > 100) {
      return `${systemMessage.substring(0, 100)}...`;
    }
    return systemMessage;
  };

  if (loading) {
    return <Loading />
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          height: '100vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: 'background.default',
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', padding: '20px 20px 20px 10px', }}>
          {/* Collapsible System Instructions */}
          

          {/* Scrollable message list */}
          <Paper
            elevation={3}
            ref={messageListRef}
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              marginBottom: '20px',
              backgroundColor: 'background.paper',
              padding: '10px',
              borderRadius: '12px',
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#2c2c2c',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#6c757d',
                borderRadius: '4px',
              },
            }}
          >
            <List sx={{ padding: '0' }}>
              {messages.map((message, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                    padding: '30px',
                    marginBottom: '10px',
                  }}
                >
                  {message.role === 'system' ? (
                    <Box
                      sx={{
                        width: '100%',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        backgroundColor: '#444', // Different color for system messages
                        border: '1px solid #6c757d',
                        color: '#e0e0e0',
                        wordWrap: 'break-word',
                      }}
                    >
                      <Typography variant="body1" fontStyle='italic' textAlign="center">
                        {`System Instructions: ${message.content}`}
                      </Typography>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: '70%',
                        padding: '10px 15px',
                        borderRadius: message.role === 'user' ? '20px 20px 0 20px' :'20px 20px 20px 0',
                        backgroundColor: message.role === 'user' ? '#6785FB' : '#252837',
                        color: message.role === 'user' ? '#fff' : '#e0e0e0',
                        wordWrap: 'break-word',
                      }}
                    >
                      {
                        (typeof message.content === 'string') ? (
                          <>
                            {message.fileUrl && (
                              <img src={message.fileUrl} style={{
                                maxWidth: 400,
                                maxHeight: 400,
                                marginBottom: 10,
                              }} />
                            )}
                            <Typography variant="body1" sx={{ 
                              whiteSpace: 'pre-wrap', 
                              wordBreak: 'break-word', 
                              overflowWrap: 'anywhere' 
                            }}>
                              {message.content}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <img src={message.content[1].image_url.url} style={{
                              maxWidth: 400,
                              maxHeight: 400,
                              marginBottom: 10,
                            }} />
                            <Typography variant="body1">
                              {message.content[0].text}
                            </Typography>
                          </>
                        )
                      }
                    </Box>
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Input area at the bottom */}
          <Paper
            elevation={3}
            sx={{
              position: 'relative',
              bottom: 0,
              width: '100%',
              backgroundColor: 'background.paper',
              padding: '20px',
            }}
          >
            {/* User message input */}
            <TextField
              label="User Message"
              multiline
              variant="outlined"
              fullWidth
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              onKeyDown={handleKeyDown} // Add keydown event
              sx={{ marginBottom: '10px', input: { color: 'text.primary' } }}
              InputLabelProps={{
                style: { color: '#a0a0a0' },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSubmit} sx={{ color: '#e0e0e0' }}>
                      {completionLoading ? (
                        <CircularProgress />
                      ) : (
                        <SendIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              disabled={completionLoading}
            />


          </Paper>
        </Box>

        {/* Options panel on the right */}
        
      </Box>
    </ThemeProvider>
  );
};

export default Playground;