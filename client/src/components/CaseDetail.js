import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Grid, Paper, Typography, Box, Chip, 
  Button, CircularProgress, Alert, Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import io from 'socket.io-client';
import axios from 'axios';
import moment from 'moment';

import CaseTimeline from './CaseTimeline';
import ReplyForm from './ReplyForm';

const SOCKET_SERVER = process.env.NODE_ENV === 'production'
  ? window.location.origin
  : 'http://localhost:5000';

function CaseDetail() {
  const { subscriptionId, caseId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [socket, setSocket] = useState(null);
  
  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER);
    
    newSocket.on('connect', () => {
      newSocket.emit('subscribe', subscriptionId);
    });
    
    newSocket.on('communication-update', (data) => {
      if (data.caseId === caseId) {
        fetchCommunications();
      }
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [subscriptionId, caseId]);
  
  // Fetch case details and communications on component mount
  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const caseRes = await axios.get(`/api/cases/${subscriptionId}/${caseId}`);
        setCaseDetails(caseRes.data);
        
        await fetchCommunications();
      } catch (err) {
        setError('Failed to load case details. Please try again.');
        setLoading(false);
      }
    };
    
    fetchCaseDetails();
  }, [subscriptionId, caseId]);
  
  // Fetch communications
  const fetchCommunications = async () => {
    try {
      const commsRes = await axios.get(`/api/cases/${subscriptionId}/${caseId}/communications`);
      setCommunications(commsRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load case communications. Please try again.');
      setLoading(false);
    }
  };
  
  // Handle reply submission
  const handleReplySubmit = async (replyData) => {
    try {
      await axios.post(`/api/cases/${subscriptionId}/${caseId}/communications`, replyData);
      fetchCommunications();
    } catch (err) {
      setError('Failed to submit reply. Please try again.');
    }
  };
  
  // Handle back button
  const handleBack = () => {
    navigate('/');
  };
  
  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          Back to Dashboard
        </Button>
      </Container>
    );
  }
  
  if (!caseDetails) return null;
  
  // Map severity to color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'error';
      case 'High': return 'warning';
      case 'Moderate': return 'info';
      case 'Low': return 'success';
      default: return 'default';
    }
  };
  
  // Map status to color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'warning';
      case 'Closed': return 'success';
      case 'WaitingForCustomer': return 'info';
      default: return 'default';
    }
  };
  
  const properties = caseDetails.properties;
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
        
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h5" component="h2">
                  {properties.title}
                </Typography>
                <Box>
                  <Chip 
                    label={`Case #${caseId}`} 
                    variant="outlined" 
                    size="small" 
                    sx={{ mr: 1 }} 
                  />
                  <Chip 
                    label={properties.status} 
                    color={getStatusColor(properties.status)}
                    size="small" 
                  />
                </Box>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={`Severity: ${properties.severity}`} 
                  color={getSeverityColor(properties.severity)}
                  size="small" 
                  sx={{ mr: 1 }} 
                />
                <Chip 
                  label={`Service: ${properties.serviceName}`} 
                  variant="outlined" 
                  size="small" 
                  sx={{ mr: 1 }} 
                />
                <Chip 
                  label={`Created: ${moment(properties.createdDate).format('MMM DD, YYYY')}`} 
                  variant="outlined"
                  size="small" 
                />
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {properties.description}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Typography variant="h6" sx={{ mb: 2 }}>Case Timeline</Typography>
          <CaseTimeline communications={communications} />
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Typography variant="h6" sx={{ mb: 2 }}>Add Reply</Typography>
          <ReplyForm onSubmit={handleReplySubmit} />
        </Grid>
      </Grid>
    </Container>
  );
}

export default CaseDetail;
