# NexSwap DEX Platform

A modern decentralized exchange (DEX) platform built with React and Express.js, featuring token swapping, liquidity pool management, and comprehensive analytics.

## Features

- **Token Swapping**: Seamless token exchange with real-time price updates
- **Liquidity Pools**: Support for both Balancer and Uniswap V3 pool types
- **Analytics Dashboard**: Comprehensive trading volume and TVL metrics
- **Modern UI**: Glass morphism design with custom color palette
- **Responsive Design**: Mobile-first approach with proper breakpoints

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
- Drizzle ORM with PostgreSQL
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
cd nexswap-dex
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your database URL and other required variables
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

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
│   └── storage.ts        # Data layer abstraction
├── shared/               # Shared types and schemas
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