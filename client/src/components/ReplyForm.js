import React, { useState } from 'react';
import { 
  Paper, TextField, Button, Box, Alert,
  CircularProgress, Typography 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

function ReplyForm({ onSubmit }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!subject.trim() || !body.trim()) {
      setError('Subject and message are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await onSubmit({ subject, body });
      setSuccess(true);
      setSubject('');
      setBody('');
    } catch (err) {
      setError('Failed to send reply. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Reply to this case
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Your reply was sent successfully!
        </Alert>
      )}
      
      <form onSubmit={handleSubmit}>
        <TextField
          label="Subject"
          variant="outlined"
          fullWidth
          margin="normal"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          disabled={loading}
        />
        
        <TextField
          label="Message"
          variant="outlined"
          fullWidth
          margin="normal"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          multiline
          rows={6}
          required
          disabled={loading}
        />
        
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            disabled={loading}
          >
            Send Reply
          </Button>
        </Box>
      </form>
    </Paper>
  );
}

export default ReplyForm;
