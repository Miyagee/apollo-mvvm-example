# Apollo MVVM Example

A complete example demonstrating the MVVM (Model-View-ViewModel) pattern using Next.js App Router, TypeScript, Apollo GraphQL, and Tailwind CSS.

## Project Structure

```
apollo-mvvm-example/
├── app/
│   ├── api/
│   │   └── graphql/
│   │       └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── graphql/
│   ├── operations/
│   │   └── devices.graphql
│   └── generated/
│       └── .gitkeep
├── models/
│   ├── Device.ts
│   └── __tests__/
│       └── Device.test.ts
├── viewmodels/
│   ├── DeviceViewModel.ts
│   └── __tests__/
│       └── DeviceViewModel.test.tsx
├── views/
│   ├── DeviceTableView.tsx
│   └── __tests__/
│       └── DeviceTableView.test.tsx
├── lib/
│   └── apollo-client.ts
├── cypress/
│   ├── e2e/
│   │   └── device-management.cy.ts
│   └── support/
│       └── e2e.ts
├── styles/
│   └── globals.css
├── schema.graphql
├── codegen.yml
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── jest.config.js
├── cypress.config.ts
└── README.md
```

## Architecture Overview

This project demonstrates a clean MVVM architecture with Next.js App Router:

- **Model**: Business logic and data structures (`/models/`)
- **View**: UI components using React and Tailwind CSS (`/views/`)
- **ViewModel**: State management and presentation logic (`/viewmodels/`)
- **GraphQL API**: Next.js API route with Apollo Server (`/app/api/graphql/`)

## Features

- ✅ Full CRUD operations for device management
- ✅ GraphQL API using Next.js Route Handlers
- ✅ Type-safe GraphQL with code generation
- ✅ MVVM architecture pattern
- ✅ Comprehensive testing (unit, integration, e2e)
- ✅ Responsive UI with Tailwind CSS v4
- ✅ Next.js 15 with App Router and Turbopack

## Prerequisites

- Node.js 18+
- npm

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/apollo-mvvm-example.git
cd apollo-mvvm-example
```

### 2. Install dependencies

```bash
npm install
```

### 3. Generate GraphQL types

```bash
npm run codegen
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

The GraphQL API endpoint will be available at [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql).

## Available Scripts

### Development

- `npm run dev` - Start Next.js development server with Turbopack
- `npm run codegen` - Generate TypeScript types from GraphQL
- `npm run codegen:watch` - Watch mode for GraphQL code generation

### Testing

- `npm test` - Run unit and integration tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run e2e` - Open Cypress for E2E testing
- `npm run e2e:headless` - Run E2E tests in headless mode
- `npm run e2e:ci` - Run E2E tests in CI mode

### Production

- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## MVVM Pattern Implementation

### Model (`/models/Device.ts`)

- Pure TypeScript classes
- Business logic and validation
- Framework agnostic
- Unit testable without UI dependencies

### ViewModel (`/viewmodels/DeviceViewModel.ts`)

- React hooks for state management
- GraphQL operations via Apollo Client
- Presentation logic and UI state
- Testable with React Testing Library

### View (`/views/DeviceTableView.tsx`)

- React components with Tailwind CSS
- No business logic
- Purely presentational
- Uses ViewModel hooks

## GraphQL API

The GraphQL API is implemented as a Next.js Route Handler at `/app/api/graphql/route.ts`, providing:

- Device queries (list and single device)
- Device mutations (create, update, delete)
- Type-safe resolvers with TypeScript

Access GraphQL Playground at [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql) in development.

## Testing Strategy

### Unit Tests (Model Layer)

Tests for business logic in isolation:

```bash
npm test -- models/__tests__/Device.test.ts
```

### Integration Tests (ViewModel Layer)

Tests for state management and GraphQL operations:

```bash
npm test -- viewmodels/__tests__/DeviceViewModel.test.tsx
```

### Component Tests (View Layer)

Tests for UI components:

```bash
npm test -- views/__tests__/DeviceTableView.test.tsx
```

### E2E Tests

Full user journey tests:

```bash
npm run e2e
```
