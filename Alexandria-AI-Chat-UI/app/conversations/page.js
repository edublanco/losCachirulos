'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Paper,
  Button
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Loading from '../components/Loading';
import { useSnackbar } from 'notistack';

import getConversations from '../api/getConversations';
import getConversation from '../api/getConversation';

const Conversations = () => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();

  const [loading, setLoading] = useState(true);
  const [conversationsData, setConversationsData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    handleGetConversations();
  }, []);

  const handleGetConversations = async () => {
    try {
      const response = await getConversations();
      setConversationsData(response.conversations);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error'} );
    } finally {
      setLoading(false);
    }
  }

  // Handle pagination change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle button actions
  const handleOpen = async (conversation) => {
    try {
      router.push(`/conversations/${conversation.id}`);
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error'} );
    }
  };

  const handleExport = async (conversation) => {
    try {
      setLoading(true);
      const response = await getConversation(conversation.id);
      const completions = response.completions.map(item => {
        return {
          role: item.role,
          content: item.content,
        };
      });
      const jsonObject = {
        id: conversation.id,
        date: new Date(conversation.timestamp).toLocaleString('sv'),
        completions,
      };


      const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(jsonObject)
      )}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `${conversation.id}.json`;
      link.click();
    } catch (err) {
      enqueueSnackbar(err.message, { variant: 'error'} );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Loading />
    );
  }

  // Paginate the data
  const paginatedData = conversationsData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ width: '100%', padding: theme.spacing(4), backgroundColor: '#1b1b1b', minHeight: '100vh', color: '#e0e0e0' }}>
      {/* Title */}
      <Typography variant="h4" gutterBottom>
        Conversations
      </Typography>

      {/* Table */}
      <Paper sx={{ width: '100%', backgroundColor: '#2b2b2b', color: '#e0e0e0' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#e0e0e0' }}>ID</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>Date</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>First Prompt</TableCell>
                <TableCell sx={{ color: '#e0e0e0' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((conversation) => (
                <TableRow key={conversation.id}>
                  <TableCell sx={{ color: '#e0e0e0' }}>{conversation.id}</TableCell>
                  <TableCell sx={{ color: '#e0e0e0' }}>{new Date(conversation.timestamp).toLocaleString('sv')}</TableCell>
                  <TableCell sx={{ color: '#e0e0e0' }}>{conversation.description}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => handleOpen(conversation)}
                      sx={{ marginRight: theme.spacing(1) }}
                    >
                      Open
                    </Button>
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      onClick={() => handleExport(conversation)}
                    >
                      Export
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Pagination */}
        <TablePagination
          component="div"
          count={conversationsData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '& .MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              color: '#e0e0e0', // Pagination text color
            },
            '& .MuiTablePagination-actions': {
              color: '#e0e0e0', // Pagination button color
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default Conversations;
