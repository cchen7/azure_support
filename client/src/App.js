import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import store from './store';

import Dashboard from './components/Dashboard';
import CaseDetail from './components/CaseDetail';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import NotFound from './components/NotFound';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#0078d4', // Azure blue
    },
    secondary: {
      main: '#50e6ff', // Azure light blue
    },
    background: {
      default: '#f8f9fa',
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <div className="App">
            <Header />
            <main style={{ padding: '1rem', minHeight: 'calc(100vh - 128px)' }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/case/:subscriptionId/:caseId" element={<CaseDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
