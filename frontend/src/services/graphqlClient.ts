import { GraphQLClient } from 'graphql-request';

// Для локальной разработки endpoint должен быть '/api/local', 
// чтобы vite proxy его перехватил.
// Для продакшена, где нет vite, он будет таким же,
// и его перехватит Angie.
const endpoint = '/api/local';

// Мы используем window.location.origin, чтобы СОЗДАТЬ полный URL
// для GraphQLClient, который не умеет в относительные пути.
// Это будет работать и локально, и на проде.
const fullEndpointUrl = new URL(endpoint, window.location.origin).href;

console.log("Resolved GraphQL Endpoint URL:", fullEndpointUrl);

export const graphQLClient = new GraphQLClient(fullEndpointUrl, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
});