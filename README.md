# SwapDotSo DEX Platform

A modern decentralized exchange (DEX) platform built with React and Express.js, featuring token swapping, liquidity pool management, and comprehensive analytics.

## Features

- **Token Swapping**: Seamless token exchange with real-time price updates
- **Liquidity Pools**: Support for both Balancer and Uniswap V3 pool types
- **Analytics Dashboard**: Comprehensive trading volume and TVL metrics
- **Modern UI**: Glass morphism design with custom color palette
- **Responsive Design**: Mobile-first approach with proper breakpoints
- **Flexible Storage**: Support for both MongoDB and in-memory storage

## Tech Stack

### Frontend
- React 18 with TypeScript
- Wouter for routing
- TanStack Query for state management
- Tailwind CSS + Radix UI for styling
- Framer Motion for animations

### Backend
- Node.js with Express.js
- TypeScript with ES modules
- **MongoDB with Mongoose** (primary) or **In-memory storage** (fallback)
- RESTful API architecture

## Color Palette

- **Primary Black**: #000000
- **Mint Green**: #CFFFE2  
- **Sage Green**: #A2D5C6
- **Light Gray**: #F6F6F6

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd SwapDotSo-dex
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
```bash
# For MongoDB support, set MONGO_URI
export MONGO_URI="mongodb://localhost:27017/somnia-defi"
# Or for MongoDB Atlas:
export MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/somnia-defi"

# If no MONGO_URI is set, the app will use in-memory storage
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Database Setup

### MongoDB (Recommended)
The app supports MongoDB as the primary database. Set the `MONGO_URI` environment variable to connect:

```bash
export MONGO_URI="mongodb://localhost:27017/somnia-defi"
```

### In-Memory Storage (Default)
If no MongoDB connection is configured, the app automatically falls back to in-memory storage with mock data.

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Route components
│   │   ├── lib/           # Utilities and configuration
│   │   └── hooks/         # Custom React hooks
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data layer abstraction
│   ├── mongo-storage.ts  # MongoDB implementation
│   └── db.ts             # Database connection
├── shared/               # Shared types and schemas
│   ├── schema.ts         # Drizzle/PostgreSQL schema (legacy)
│   └── mongo-schema.ts   # MongoDB schema
└── components.json       # shadcn/ui configuration
```

## API Endpoints

- `GET /api/tokens` - Get available tokens
- `GET /api/pools` - Get liquidity pools
- `POST /api/swaps` - Execute token swap
- `GET /api/analytics` - Get trading analytics
- `GET /api/stats` - Get platform statistics

## License

MIT License - feel free to use this project for learning and development.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

Built with ❤️ for the DeFi community.