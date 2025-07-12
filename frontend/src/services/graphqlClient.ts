// src/services/graphqlClient.ts
import { GraphQLClient } from 'graphql-request';

// Используем import.meta.env для доступа к переменным окружения в Vite
const endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT || "http://localhost:5000/api/v1";

console.log("Using GraphQL Endpoint:", endpoint);

if (!import.meta.env.VITE_GRAPHQL_ENDPOINT) {
    console.warn("VITE_GRAPHQL_ENDPOINT environment variable is not set. Using default:", endpoint);
}
if (!endpoint) {
    console.error("GraphQL endpoint URL could not be determined.");
}

const fullEndpointUrl = new URL(endpoint, window.location.origin).href;

console.log("Resolved GraphQL Endpoint URL:", fullEndpointUrl);

export const graphQLClient = new GraphQLClient(fullEndpointUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
});