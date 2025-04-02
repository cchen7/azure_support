import React, { useState } from 'react';
import { 
  Paper, Typography, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, TablePagination, Chip, TableSortLabel, Box
} from '@mui/material';
import moment from 'moment';

// Severity color mapping
const severityColors = {
  'Critical': 'error',
  'High': 'warning',
  'Moderate': 'info',
  'Low': 'success'
};

// Status display mapping
const statusChip = (status) => {
  let color = 'default';
  
  switch (status) {
    case 'Open':
      color = 'warning';
      break;
    case 'Closed':
      color = 'success';
      break;
    case 'WaitingForCustomer':
      color = 'info';
      break;
    default:
      color = 'default';
  }
  
  return <Chip label={status} size="small" color={color} />;
};

function CaseList({ cases, onCaseClick }) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('modifiedDate');
  const [order, setOrder] = useState('desc');
  
  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  // Create sort handler
  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };
  
  // Sort function
  const descendingComparator = (a, b, orderBy) => {
    const propA = a.properties ? a.properties[orderBy] : a[orderBy];
    const propB = b.properties ? b.properties[orderBy] : b[orderBy];
    
    if (propB < propA) {
      return -1;
    }
    if (propB > propA) {
      return 1;
    }
    return 0;
  };
  
  const getComparator = (order, orderBy) => {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };
  
  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };
  
  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 540 }}>
        <Table stickyHeader aria-label="support cases table">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'title'}
                  direction={orderBy === 'title' ? order : 'asc'}
                  onClick={createSortHandler('title')}
                >
                  Title
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'severity'}
                  direction={orderBy === 'severity' ? order : 'asc'}
                  onClick={createSortHandler('severity')}
                >
                  Severity
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={createSortHandler('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'createdDate'}
                  direction={orderBy === 'createdDate' ? order : 'asc'}
                  onClick={createSortHandler('createdDate')}
                >
                  Created
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'modifiedDate'}
                  direction={orderBy === 'modifiedDate' ? order : 'asc'}
                  onClick={createSortHandler('modifiedDate')}
                >
                  Last Updated
                </TableSortLabel>
              </TableCell>
              <TableCell>Service</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body1">No support cases found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              stableSort(cases, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((caseItem) => {
                  // Handle both API response and DB format
                  const properties = caseItem.properties || caseItem;
                  return (
                    <TableRow 
                      hover
                      key={caseItem.name || caseItem.id} 
                      onClick={() => onCaseClick(caseItem)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell component="th" scope="row">
                        {properties.title}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={properties.severity} 
                          color={severityColors[properties.severity] || 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        {statusChip(properties.status)}
                      </TableCell>
                      <TableCell>
                        {moment(properties.createdDate).format('MMM DD, YYYY')}
                      </TableCell>
                      <TableCell>
                        {moment(properties.modifiedDate).fromNow()}
                      </TableCell>
                      <TableCell>{properties.serviceName}</TableCell>
                    </TableRow>
                  );
                })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={cases.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

export default CaseList;
