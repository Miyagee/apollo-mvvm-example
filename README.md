# Apollo MVVM Example

A complete example demonstrating the MVVM (Model-View-ViewModel) pattern using Next.js App Router, TypeScript, Apollo GraphQL, and Tailwind CSS.

## Project Structure

```
apollo-mvvm-example/
├── app/
│   ├── api/
│   │   └── graphql/
│   │       ├── route.ts
│   │       ├── resolvers/
│   │       │   ├── index.ts
│   │       │   ├── queries/
│   │       │   │   ├── device.ts
│   │       │   │   └── device.spec.ts
│   │       │   └── mutations/
│   │       │       ├── device.ts
│   │       │       └── device.spec.ts
│   │       ├── data/
│   │       │   └── deviceStore.ts        # In-memory store with simulation
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
│   ├── shared/
│   │   ├── useForm.ts                    # Generic reusable form ViewModel
│   │   ├── useForm.spec.ts
│   │   ├── useSearchInput.ts             # Debounced search input ViewModel
│   │   ├── useSearchInput.spec.ts
│   │   ├── useSnackbar.ts                # Toast/notification ViewModel
│   │   └── useSnackbar.spec.ts
│   ├── DeviceViewModel/
│   │   ├── index.tsx                     # Data ViewModel (GraphQL operations)
│   │   └── DeviceViewModel.spec.tsx
│   ├── DeviceFormViewModel/
│   │   ├── index.ts                      # Device form ViewModel
│   │   └── DeviceFormViewModel.spec.ts
│   └── DeviceTableViewModel/
│       ├── index.ts                      # Coordinating ViewModel
│       └── DeviceTableViewModel.spec.tsx
├── views/
│   └── DeviceTableView/
│       ├── index.tsx                     # Stateless View component
│       ├── DeviceTableView.spec.tsx
│       ├── components/
│       │   ├── DeleteConfirmModal.tsx
│       │   ├── DeleteConfirmModal.spec.tsx
│       │   ├── DeviceForm.tsx            # Stateless form component
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
│       │   ├── StatusBadge.spec.tsx
│       │   ├── Snackbar.tsx              # Toast notification component
│       │   └── Snackbar.spec.tsx
│       └── utils/
│           └── status.ts
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

This project demonstrates a **strict MVVM architecture** with Next.js App Router where **all state lives in ViewModels** and Views are completely stateless.

```
          Shared ViewModels (Generic, reusable)
          ┌──────────────────────────────────────────────────────┐
          │  useForm<T>()    useSearchInput()    useSnackbar()   │
          │  - values        - debouncing        - messages      │
          │  - errors        - clear             - show/dismiss  │
          │  - touched                                           │
          └──────────────────────────────────────────────────────┘
                   │                    │                │
                   ▼                    │                │
┌──────────────────────────┐            │                │
│   useDeviceForm()        │            │                │
│   (Composes useForm)     │            │                │
│   - device-specific      │            │                │
│     validation rules     │            │                │
└──────────────────────────┘            │                │
           │                            │                │
           │  ┌──────────────────────┐  │                │
           │  │    useDevices()      │  │                │
           │  │    (Data VM)         │  │                │
           │  │  - GraphQL ops       │  │                │
           │  │  - CRUD, polling     │  │                │
           │  └──────────────────────┘  │                │
           │             │              │                │
           │    ┌────────┘  ┌───────────┘                │
           │    │           │    ┌───────────────────────┘
           ▼    ▼           ▼    ▼
┌─────────────────────────────────────────────────────────────┐
│              useDeviceTableViewModel()                      │
│              (Coordinating ViewModel)                       │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Composes:                                           │    │
│  │  • useDevices()      - GraphQL data operations      │    │
│  │  • useDeviceForm()   - form state & validation      │    │
│  │  • useSearchInput()  - debounced search             │    │
│  │  • useSnackbar()     - toast notifications          │    │
│  └─────────────────────────────────────────────────────┘    │
│  + UI state (modals, selection, delete confirmation)        │
│  + All coordination logic                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
          ┌─────────────────────────────────────┐
          │         DeviceTableView             │
          │         (Completely stateless)      │
          │         No useState, just props     │
          └─────────────────────────────────────┘
```

### Key Layers

- **Model** (`/models/`): Business logic and data structures
- **View** (`/views/`): **Stateless** UI components - no `useState`
- **ViewModel** (`/viewmodels/`): All state management and presentation logic
- **GraphQL API** (`/app/api/graphql/`): Next.js Route Handler with Apollo Server

## Features

- ✅ **Strict MVVM** - Views are completely stateless, all state in ViewModels
- ✅ **Composable ViewModels** - Reusable `useForm<T>` composed into domain-specific VMs
- ✅ Full CRUD operations for device management
- ✅ GraphQL API using Next.js Route Handlers
- ✅ Type-safe GraphQL with code generation
- ✅ **Real-time updates** via polling with `cache-and-network` fetch policy
- ✅ **Backend simulation** - Device status changes automatically for demo
- ✅ Comprehensive testing:
  - BDD-style tests (Given/When/Then)
  - ViewModel tests with `renderHook`
  - E2E tests with Cypress
- ✅ Responsive UI with Tailwind CSS v4
- ✅ Next.js 15 with App Router and Turbopack
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

### Model (`/models/Device/`)

- Pure TypeScript classes with business logic
- Static validation methods (`isValidName`, `isValidSerialNumber`, etc.)
- Framework agnostic (no UI concerns)
- Transformation and utility methods
- Unit tested with behavior-focused tests

### ViewModel Layer (`/viewmodels/`)

The ViewModel layer follows a **composable architecture**:

#### Shared ViewModels (`/viewmodels/shared/`)

Reusable, generic hooks that can be composed into any domain-specific ViewModel:

##### `useForm<T>` - Form State Management
```typescript
const form = useForm<DeviceFormValues>({
  initialValues: { name: '', ... },
  validationRules: {
    name: (v) => !v.trim() ? 'Name is required' : null,
  },
});
// form.values, form.errors, form.touched, form.setField(), form.validate()
```

##### `useSearchInput` - Debounced Search
```typescript
const search = useSearchInput({
  debounceMs: 300,
  onDebouncedChange: (value) => filterDevices(value),
});
// search.inputValue (immediate), search.debouncedValue, search.isDebouncing
```

##### `useSnackbar` - Toast Notifications
```typescript
const snackbar = useSnackbar();

// Show different types of messages
snackbar.showSuccess('Device created!');
snackbar.showError('Failed to save');
snackbar.showInfo('Tip: You can edit devices');
snackbar.showWarning('Connection unstable');

// Manual dismiss
snackbar.dismiss(messageId);
snackbar.dismissAll();

// Access messages for rendering
// snackbar.messages: SnackbarMessage[]
```

#### Data ViewModel (`/viewmodels/DeviceViewModel/`)

- GraphQL operations via Apollo Client hooks
- Manages devices, loading, error states
- Provides CRUD actions
- Search/filter functionality
- **Real-time updates** with `cache-and-network` + polling

#### Form ViewModel (`/viewmodels/DeviceFormViewModel/`)

- Composes `useForm<T>` with device-specific validation
- Uses `DeviceModel` static validation methods
- Handles create vs edit mode logic

#### Coordinating ViewModel (`/viewmodels/DeviceTableViewModel/`)

- Composes Data VM + Form VM + Search VM + Snackbar VM
- Manages UI state (modal visibility, selection, delete confirmation)
- **Single source of truth** for the entire view
- Automatically shows success/error notifications on CRUD operations
- View components receive all state/actions from here

```typescript
const vm = useDeviceTableViewModel();

// All state from ViewModel
vm.devices, vm.isFormOpen, vm.formData, vm.formErrors, vm.snackbarMessages

// All actions from ViewModel
vm.openCreateForm(), vm.setFormField('name', 'value'), vm.submitForm()

// Snackbar auto-triggers on:
// - Device created successfully
// - Device updated successfully
// - Device deleted successfully
// - Any operation failure
```

### View Layer (`/views/`)

- **Completely stateless** - no `useState` in any View component
- All state and actions received via props from ViewModel
- Pure presentational components
- Easy to test in isolation

```tsx
// View has NO useState - everything comes from ViewModel
function DeviceTableView() {
  const vm = useDeviceTableViewModel();

  return (
    <DeviceForm
      formData={vm.formData}
      errors={vm.formErrors}
      onFieldChange={vm.setFormField}
      onSubmit={vm.submitForm}
    />
  );
}
```

## Real-Time Data Strategy

This example demonstrates real-time patterns using:

1. **`cache-and-network` fetch policy** - Instant perceived performance (show cache, then fetch)
2. **Polling** - Periodic data refresh every 10 seconds
3. **Backend simulation** - Devices change status automatically

### Apollo NetworkStatus

The ViewModel exposes Apollo's `NetworkStatus` for fine-grained loading states:

| Status | Meaning |
|--------|---------|
| `loading` | Initial load in progress |
| `refetch` | Manual refetch in progress |
| `poll` | Polling request in flight |
| `ready` | Ready, no request pending |

```typescript
// Show subtle indicator during background updates
{(vm.isPolling || vm.isRefetching) && <span>Syncing...</span>}
```

### Backend Device Simulation

The device store simulates real-world behavior:
- **30% chance**: Toggle device status (ONLINE ↔ OFFLINE)
- **70% chance**: Update `lastSeenAt` timestamp
- Runs every 5 seconds

## Advanced: Real-Time with GraphQL Subscriptions

This example uses polling for simplicity. For true real-time push updates, you can implement GraphQL subscriptions using `graphql-ws`:

### Schema Addition
```graphql
type Subscription {
  deviceStatusChanged(deviceId: ID): Device
  deviceCreated: Device
  deviceDeleted: ID
}
```

### Requirements
- WebSocket server (Next.js Route Handlers don't support WebSockets)
- `graphql-ws` library for client and server
- Separate WebSocket endpoint

### Resources
- [Apollo Subscriptions Docs](https://www.apollographql.com/docs/react/data/subscriptions)
- [graphql-ws library](https://github.com/enisdenjo/graphql-ws)

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
