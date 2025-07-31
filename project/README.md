# Apify Platform Integration

A full-stack web application that demonstrates integration with the Apify platform, allowing users to authenticate, browse their actors, view schemas dynamically, and execute actor runs with real-time results.

## Features

### Frontend
- **Authentication**: Secure API key-based authentication with Apify
- **Actor Management**: Browse and search through available actors
- **Dynamic Schema Loading**: Fetch and render actor input schemas at runtime
- **Form Generation**: Automatically generate forms based on actor schemas
- **Real-time Execution**: Execute actors and monitor progress with live updates
- **Results Visualization**: Display execution results with export capabilities
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Backend
- **Secure API Proxy**: Secure communication with Apify's API
- **Rate Limiting**: Protection against abuse with request rate limiting
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Error Handling**: Centralized error handling and logging
- **Health Monitoring**: Health check endpoints for monitoring

## Architecture

### Frontend (React + TypeScript + Tailwind CSS)
- **Components**: Modular, reusable React components
- **Services**: API client for backend communication
- **State Management**: React hooks for local state management
- **Styling**: Tailwind CSS for responsive, modern UI

### Backend (Node.js + Express)
- **API Routes**: RESTful API endpoints for Apify integration
- **Security**: Helmet, CORS, and rate limiting middleware
- **Validation**: Request validation and sanitization
- **Error Handling**: Comprehensive error handling middleware

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Apify API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd apify-integration
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Environment Setup**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp server/.env.example server/.env
   
   # Edit .env files with your configuration
   ```

### Development

**Start both frontend and backend:**
```bash
npm run dev:full
```

**Or start them separately:**

Frontend only:
```bash
npm run dev
```

Backend only:
```bash
npm run dev:server
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Production Build

```bash
npm run build
```

## API Endpoints

### Authentication
All API endpoints require an Apify API key passed as a Bearer token in the Authorization header.

### Endpoints

- `GET /api/apify/actors` - Get user's actors
- `GET /api/apify/actors/:actorId/schema` - Get actor input schema
- `POST /api/apify/actors/:actorId/runs` - Start actor run
- `GET /api/apify/runs/:runId` - Get run details
- `GET /api/apify/runs/:runId/dataset` - Get run dataset
- `GET /api/apify/runs/:runId/wait` - Wait for run completion
- `GET /health` - Health check

## Security Features

- **API Key Protection**: API keys are handled server-side only
- **Rate Limiting**: Prevents API abuse
- **CORS Configuration**: Restricts cross-origin requests
- **Input Validation**: Validates and sanitizes all inputs
- **Error Sanitization**: Prevents information leakage in errors

## Technology Stack

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Vite
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- CORS
- Helmet (security)
- Express Rate Limit

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details