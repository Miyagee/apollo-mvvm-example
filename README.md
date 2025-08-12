# Apollo MVVM Example

A complete example demonstrating the MVVM (Model-View-ViewModel) pattern using Next.js App Router, TypeScript, Apollo GraphQL, and Tailwind CSS.

## Project Structure

```
apollo-mvvm-example/
├── app/
│   ├── api/
│   │   └── graphql/
│   │       ├── route.ts
│   │       ├── route.spec.ts
│   │       ├── resolvers/
│   │       │   ├── index.ts
│   │       │   ├── queries/
│   │       │   │   ├── device.ts
│   │       │   │   └── device.spec.ts
│   │       │   └── mutations/
│   │       │       ├── device.ts
│   │       │       └── device.spec.ts
│   │       ├── data/
│   │       │   └── deviceStore.ts
│   │       └── validators/
│   │           ├── deviceValidator.ts
│   │           └── deviceValidator.spec.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── graphql/
│   ├── operations/
│   │   └── devices.graphql
│   └── generated/
│       └── index.ts
├── models/
│   └── Device/
│       ├── index.ts
│       └── Device.spec.ts
├── viewmodels/
│   └── DeviceViewModel/
│       ├── index.tsx
│       └── DeviceViewModel.spec.tsx
├── views/
│   └── DeviceTableView/
│       ├── index.tsx
│       ├── DeviceTableView.spec.tsx
│       ├── components/
│       │   ├── DeleteConfirmModal.tsx
│       │   ├── DeleteConfirmModal.spec.tsx
│       │   ├── DeviceForm.tsx
│       │   ├── DeviceForm.spec.tsx
│       │   ├── DeviceTable.tsx
│       │   ├── DeviceTable.spec.tsx
│       │   ├── ErrorState.tsx
│       │   ├── ErrorState.spec.tsx
│       │   ├── LoadingState.tsx
│       │   ├── LoadingState.spec.tsx
│       │   ├── SearchBar.tsx
│       │   ├── SearchBar.spec.tsx
│       │   ├── StatusBadge.tsx
│       │   └── StatusBadge.spec.tsx
│       └── utils/
│           └── statusStyles.ts
├── lib/
│   └── apollo-client.ts
├── cypress/
│   ├── e2e/
│   │   └── device-management.cy.ts
│   └── support/
│       ├── commands.ts
│       └── e2e.ts
├── schema.graphql
├── codegen.yml
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── jest.config.js
├── jest.setup.js
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
- ✅ MVVM architecture pattern with clear separation of concerns
- ✅ Comprehensive testing:
  - BDD-style API tests
  - Behavior-focused component tests
  - E2E tests with Cypress
- ✅ Responsive UI with Tailwind CSS v4
- ✅ Next.js 15 with App Router and Turbopack
- ✅ System font stack for optimal performance
- ✅ Apollo Client with React hooks integration

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

### Model (`/models/Device/index.ts`)

- Pure TypeScript classes with business logic
- Data validation methods
- Framework agnostic (no UI concerns)
- Transformation and utility methods
- Unit tested with behavior-focused tests

### ViewModel (`/viewmodels/DeviceViewModel/index.tsx`)

- React hooks for state management
- GraphQL operations via Apollo Client hooks
- Manages loading, error, and data states
- Provides actions for CRUD operations
- Handles search/filter logic
- Tested with React Testing Library

### View (`/views/DeviceTableView/`)

- React components with Tailwind CSS v4
- Purely presentational components
- No business logic or direct API calls
- Uses ViewModel hooks for all state and actions
- Component-based architecture with:
  - Main view component
  - Reusable UI components
  - Utility functions for styling

## GraphQL API

The GraphQL API is implemented as a Next.js Route Handler at `/app/api/graphql/route.ts`, providing:

- Device queries (list and single device)
- Device mutations (create, update, delete)
- Type-safe resolvers with TypeScript

Access GraphQL Playground at [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql) in development.

## Testing Strategy

### BDD (Behavior-Driven Development) Approach

All tests in this project follow the BDD methodology using the Given-When-Then pattern. This ensures tests are focused on behaviors and user outcomes rather than implementation details.

### Test Structure

Tests use a consistent BDD format:

```typescript
describe('ComponentName', () => {
  describe('Given [initial context]', () => {
    describe('When [action happens]', () => {
      it('Then [expected outcome]', () => {
        // test implementation
      });
    });
  });
});
```

### Running Tests

All tests are co-located with their source files for easy discovery:

```bash
# Run all tests
npm test

# Run specific test files
npm test -- models/Device/Device.spec.ts
npm test -- views/DeviceTableView/components/DeviceForm.spec.tsx

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Philosophy

- **Behavior-Focused**: All tests use Given-When-Then structure to describe behaviors
- **User-Centric**: Tests verify what users experience, not how code works internally
- **No Implementation Details**: Tests avoid testing private methods or internal state
- **Co-located Tests**: Test files are next to source files (`.spec.ts` or `.spec.tsx`)
- **Comprehensive Coverage**: Models, ViewModels, Views, and API all have behavior-driven tests

### Test Categories

#### Model Tests (`/models/**/*.spec.ts`)
- Test business logic behaviors
- Validate data transformation outcomes
- Verify validation rules work correctly

#### View Tests (`/views/**/*.spec.tsx`)
- Test user interactions
- Verify visual feedback and state changes
- Ensure accessibility requirements are met

#### API Tests (`/app/api/**/*.spec.ts`)
- Test API behaviors and responses
- Validate error handling
- Ensure data integrity

### E2E Tests

Full user journey tests using Cypress:

```bash
# Interactive mode
npm run e2e

# Headless mode
npm run e2e:headless

# CI mode
npm run e2e:ci
```
