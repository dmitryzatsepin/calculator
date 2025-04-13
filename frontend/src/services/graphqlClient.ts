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

export const graphQLClient = new GraphQLClient(endpoint || '', {

});