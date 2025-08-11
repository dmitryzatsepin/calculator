import { GraphQLClient } from 'graphql-request';

const endpoint = '/api/v1';

const fullEndpointUrl = new URL(endpoint, window.location.origin).href;

console.log("Resolved GraphQL Endpoint URL:", fullEndpointUrl);

export const graphQLClient = new GraphQLClient(fullEndpointUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
});