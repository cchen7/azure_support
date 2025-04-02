import React from 'react';
import { 
  Timeline, TimelineItem, TimelineSeparator, TimelineConnector,
  TimelineContent, TimelineDot, TimelineOppositeContent
} from '@mui/lab';
import { Typography, Paper, Box } from '@mui/material';
import {
  Chat as ChatIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Create as CreateIcon
} from '@mui/icons-material';
import moment from 'moment';

function CaseTimeline({ communications }) {
  // Sort communications by date (newest first)
  const sortedCommunications = [...communications].sort((a, b) => {
    return new Date(b.properties.createdDate) - new Date(a.properties.createdDate);
  });

  // Get icon based on communication type
  const getCommunicationIcon = (type) => {
    switch (type) {
      case 'Web':
        return <ChatIcon />;
      case 'Email':
        return <EmailIcon />;
      case 'Phone':
        return <PhoneIcon />;
      default:
        return <CreateIcon />;
    }
  };
  
  // Get timeline dot color based on sender
  const getDotColor = (sender) => {
    if (sender.includes('Microsoft') || sender.includes('Azure')) {
      return 'primary';
    }
    return 'secondary';
  };
  
  return (
    <Timeline position="right" sx={{ p: 0 }}>
      {sortedCommunications.length === 0 ? (
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No communications found for this case.
          </Typography>
        </Box>
      ) : (
        sortedCommunications.map((comm) => (
          <TimelineItem key={comm.name}>
            <TimelineOppositeContent sx={{ maxWidth: '150px' }}>
              <Typography variant="body2" color="text.secondary">
                {moment(comm.properties.createdDate).format('MMM DD, HH:mm')}
              </Typography>
            </TimelineOppositeContent>
            
            <TimelineSeparator>
              <TimelineDot color={getDotColor(comm.properties.sender)}>
                {getCommunicationIcon(comm.properties.communicationType)}
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            
            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Paper elevation={1} sx={{ p: 2 }}>
                <Typography variant="subtitle1">
                  {comm.properties.sender}
                </Typography>
                
                {comm.properties.subject && (
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {comm.properties.subject}
                  </Typography>
                )}
                
                <Typography variant="body2" component="div" sx={{ whiteSpace: 'pre-line' }}>
                  {comm.properties.body}
                </Typography>
              </Paper>
            </TimelineContent>
          </TimelineItem>
        ))
      )}
    </Timeline>
  );
}

export default CaseTimeline;
