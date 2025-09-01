# Contributing to SwapDotSo

Thank you for your interest in contributing to SwapDotSo! This document provides guidelines for contributing to the project.

## Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/SwapDotSo-dex.git
   cd SwapDotSo-dex
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Configure your environment variables
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## Code Style

- **TypeScript**: All code should be written in TypeScript
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code will be automatically formatted
- **Components**: Use functional components with hooks
- **Styling**: Use Tailwind CSS with the existing design system

## Project Structure

- `client/src/components/` - Reusable UI components
- `client/src/pages/` - Page components for routing
- `client/src/lib/` - Utility functions and configurations
- `server/` - Express.js backend code
- `shared/` - Shared types and schemas

## Submitting Changes

1. Create a feature branch from `main`
2. Make your changes following the code style
3. Test your changes thoroughly
4. Submit a pull request with a clear description

## Guidelines

- Keep commits focused and atomic
- Write clear commit messages
- Update documentation as needed
- Add tests for new features
- Ensure responsive design works across devices

## Questions?

Feel free to open an issue for questions or discussions about the project.