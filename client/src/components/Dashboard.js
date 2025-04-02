import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Grid, Paper, Typography, Box, 
  FormControl, InputLabel, Select, MenuItem, Chip,
  CircularProgress, Alert, Button 
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import io from 'socket.io-client';
import axios from 'axios';

import CaseList from './CaseList';

const SOCKET_SERVER = process.env.NODE_ENV === 'production'
  ? window.location.origin
  : 'http://localhost:5000';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [selectedSubscriptions, setSelectedSubscriptions] = useState([]);
  const [cases, setCases] = useState([]);
  const navigate = useNavigate();
  
  // Set up socket.io connection
  useEffect(() => {
    const socket = io(SOCKET_SERVER);
    
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });
    
    socket.on('communication-update', (data) => {
      // Refresh cases when a communication is updated
      if (selectedSubscriptions.length > 0) {
        fetchCases(selectedSubscriptions);
      }
    });
    
    // Clean up socket connection on unmount
    return () => {
      socket.disconnect();
    };
  }, [selectedSubscriptions]);
  
  // Load subscriptions on component mount
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const res = await axios.get('/api/subscriptions');
        setSubscriptions(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load subscriptions. Please try again.');
        setLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, []);
  
  // Fetch cases for selected subscriptions
  const fetchCases = async (subs) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/cases?subscriptions=${subs.join(',')}`);
      setCases(res.data);
    } catch (err) {
      setError('Failed to load support cases. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle subscription selection
  const handleSubscriptionChange = (event) => {
    const selectedSubs = event.target.value;
    setSelectedSubscriptions(selectedSubs);
    
    if (selectedSubs.length > 0) {
      // Subscribe to socket channels for each subscription
      selectedSubs.forEach(subId => {
        const socket = io(SOCKET_SERVER);
        socket.emit('subscribe', subId);
      });
      
      fetchCases(selectedSubs);
    } else {
      setCases([]);
    }
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    if (selectedSubscriptions.length > 0) {
      fetchCases(selectedSubscriptions);
    }
  };
  
  // Handle click on a case
  const handleCaseClick = (caseItem) => {
    navigate(`/case/${caseItem.subscriptionId || caseItem.subscription_id}/${caseItem.name || caseItem.id}`);
  };
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Azure Support Portal
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <FormControl fullWidth>
                <InputLabel id="subscription-select-label">Select Subscriptions</InputLabel>
                <Select
                  labelId="subscription-select-label"
                  id="subscription-select"
                  multiple
                  value={selectedSubscriptions}
                  onChange={handleSubscriptionChange}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const sub = subscriptions.find(s => s.subscriptionId === value);
                        return (
                          <Chip 
                            key={value} 
                            label={sub ? sub.displayName : value} 
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                >
                  {subscriptions.map((subscription) => (
                    <MenuItem key={subscription.subscriptionId} value={subscription.subscriptionId}>
                      {subscription.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading || selectedSubscriptions.length === 0}
                fullWidth
              >
                Refresh Cases
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {!loading && selectedSubscriptions.length === 0 && (
          <Alert severity="info">
            Please select at least one subscription to view support cases.
          </Alert>
        )}
        
        {!loading && selectedSubscriptions.length > 0 && (
          <CaseList cases={cases} onCaseClick={handleCaseClick} />
        )}
      </Box>
    </Container>
  );
}

export default Dashboard;
