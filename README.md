# Azure Support Portal

A multi-subscription web portal for managing Azure support cases under a single tenant, built using the Azure Support API.

## Features

- **Multi-Subscription Management**: View and manage support cases across multiple Azure subscriptions.
- **Aggregated Support Case View**: See all support cases in one centralized list.
- **Real-Time Case Timeline**: Get dynamic updates of case communications without page refreshes.
- **Unified Case Management**: View and reply to support cases from a single interface.

## Tech Stack

- **Frontend**: React.js with Material UI
- **Backend**: Node.js with Express
- **Database**: SQLite (for local data caching)
- **Real-time Updates**: Socket.IO
- **Authentication**: Azure AD integration

## Security Considerations

- No sensitive data is stored in the local SQLite database
- Authentication tokens are stored in-memory only
- Azure credentials are managed via environment variables

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- npm or yarn
- Azure subscription with access to the Azure Support API

### Environment Setup

1. Clone the repository
2. Create a `.env` file in the root directory based on `.env.example`
3. Fill in your Azure tenant ID, client ID, and client secret

### Installation

```bash
# Install server dependencies
npm install

# Install client dependencies
npm run install-client

# Run both client and server in development mode
npm run dev
```

### Production Deployment

```bash
# Build the React client
npm run build

# Start the production server
npm start
```

## Azure API Permissions Required

- Your service principal needs the following permissions:
  - Microsoft.Support/supportTickets/read
  - Microsoft.Support/supportTickets/write
  - Microsoft.Support/communications/read
  - Microsoft.Support/communications/write

## Project Structure

- `/client` - React frontend application
- `/backend` - Express server API
- `/backend/database` - SQLite database and schema
- `/backend/services` - Azure API integration services
- `/backend/routes` - API route handlers

## License

MIT
