# Agent Ramp Tracker

A dashboard application for tracking insurance agent performance metrics, managing agent status transitions, and visualizing team performance.

## Features

- **Dashboard** - Visualize agent and team performance metrics
- **Metrics Tracking** - Record and monitor key performance indicators:
  - Close Rate
  - Average Premium
  - Place Rate
  - CAP Score (Close Rate × Average Premium × Place Rate)
  - Leads Per Day
- **Agent Management** - Track agents across their career journey:
  - Training Queue - New agents with progressive benchmarks
  - Performance Queue - Established agents
  - Archive System - Track departed agents without affecting team metrics
- **Team Analytics** - Compare team performance across locations
- **Status Management** - Tools to promote agents when they meet benchmarks

## Screenshots

_Add screenshots here_

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Tremor (charts/visualizations)
- **Backend**: Next.js API Routes
- **Database**: SQLite (via Prisma ORM)
- **Styling**: Tailwind CSS, shadcn/ui components

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository

   ```
   git clone https://github.com/your-username/agent-ramp-tracker.git
   cd agent-ramp-tracker
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Set up the database

   ```
   npx prisma migrate dev --name init
   ```

4. Start the development server

   ```
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Production Build

1. Build the application

   ```
   npm run build
   ```

2. Start the production server
   ```
   npm start
   ```

### Deployment Options

- **Vercel** - The easiest deployment option for Next.js applications

  ```
  npm install -g vercel
  vercel
  ```

- **Docker** - For containerized deployment
  ```
  docker build -t agent-ramp-tracker .
  docker run -p 3000:3000 agent-ramp-tracker
  ```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
DATABASE_URL="file:./dev.db"
```

## Project Structure

- `/src/app` - Next.js app router pages and API routes
- `/src/components` - React components
- `/src/lib` - Utility libraries and database connection
- `/src/utils` - Helper functions
- `/prisma` - Database schema and migrations

## Usage Guide

### Adding a New Agent

1. Navigate to the Agents page
2. Click "Add Agent" and fill in the required information
3. The agent will be placed in the Training queue by default

### Recording Metrics

1. Select an agent from the dashboard
2. Click "Add Metrics" and enter the weekly performance data
3. The CAP score will be automatically calculated

### Promoting Agents

1. Go to the Agent Status Manager
2. Select the "Ready for Promotion" tab
3. Click "Promote to Performance" for eligible agents
4. Or use "Promote All" to promote all eligible agents at once

### Archiving Agents

1. For agents who leave the company, use the "Archive Agent" button
2. Archived agents will no longer count in team performance metrics
3. You can restore archived agents if they return

## Monthly Benchmarks

Agents in training are measured against progressive benchmarks:

| Month | Phase                | CAP Score | Close Rate |
| ----- | -------------------- | --------- | ---------- |
| 2     | Building Foundations | 75        | 10%        |
| 3     | Gaining Momentum     | 105       | 14%        |
| 4     | Ramping Up           | 135       | 18%        |
| 5     | Building Confidence  | 142       | 19%        |
| 6     | Graduation           | 150       | 20%        |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Tremor](https://www.tremor.so/) - React components for analytics dashboards
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - ORM
