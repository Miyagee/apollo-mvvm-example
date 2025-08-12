import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { NextRequest } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { resolvers } from './resolvers';

// Load schema from file
const typeDefs = readFileSync(join(process.cwd(), 'schema.graphql'), 'utf-8');

// Create Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true, // Enable introspection in production for demo purposes
});

// Create Next.js handler
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    // Add any context like authentication here
    return { req };
  },
});

// Export handlers for different HTTP methods
export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  try {
    // Check if request has a body
    const contentType = request.headers.get('content-type');

    // For GraphQL requests, we need to ensure the body exists
    if (!contentType || !contentType.includes('application/json')) {
      // If it's not JSON, let the handler deal with it (might be GraphQL playground)
      return handler(request);
    }

    // Clone the request to read the body without consuming it
    const clonedRequest = request.clone();
    const body = await clonedRequest.text();

    if (!body || body.trim() === '') {
      return new Response(
        JSON.stringify({
          errors: [{ message: 'Request body is empty' }],
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate JSON parsing
    try {
      JSON.parse(body);
    } catch {
      return new Response(
        JSON.stringify({
          errors: [{ message: 'Invalid JSON in request body' }],
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return handler(request);
  } catch (error) {
    console.error('GraphQL route error:', error);
    return new Response(
      JSON.stringify({
        errors: [{ message: 'Internal server error' }],
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
