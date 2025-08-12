// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Custom error handling
// eslint-disable-next-line @typescript-eslint/no-unused-vars
Cypress.on('uncaught:exception', (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // on uncaught exceptions from the application
  if (err.message.includes('ResizeObserver loop')) {
    return false;
  }
  // Ignore Apollo errors in tests that intentionally cause them
  if (err.message.includes('Response not successful') || err.message.includes('ApolloError')) {
    return false;
  }
  // Let other errors fail the test
  return true;
});

// GraphQL helpers
// eslint-disable-next-line @typescript-eslint/no-explicit-any
Cypress.Commands.add('interceptGraphQL', (operationName: string, response: any) => {
  cy.intercept('POST', '/api/graphql', (req) => {
    if (req.body.operationName === operationName) {
      req.reply(response);
    }
  });
});

// Wait for GraphQL operations
Cypress.Commands.add('waitForGraphQL', (operationName: string) => {
  cy.intercept('POST', '/api/graphql', (req) => {
    if (req.body.operationName === operationName) {
      req.alias = operationName;
    }
  });
  cy.wait(`@${operationName}`);
});

// Type declarations for custom commands
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      interceptGraphQL(operationName: string, response: any): void;
      waitForGraphQL(operationName: string): void;
    }
  }
}

export {};
