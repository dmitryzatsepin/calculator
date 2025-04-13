// src/services/graphqlClient.ts
import { GraphQLClient } from 'graphql-request';

// URL вашего GraphQL эндпоинта
const endpoint = process.env.REACT_APP_GRAPHQL_ENDPOINT || // Для Create React App
                 process.env.VITE_GRAPHQL_ENDPOINT || // Для Vite
                 "http://localhost:5000/graphql"; // Значение по умолчанию

if (!endpoint) {
    console.error("GraphQL endpoint URL is not defined. Please set REACT_APP_GRAPHQL_ENDPOINT or VITE_GRAPHQL_ENDPOINT environment variable.");
}

// Создаем экземпляр клиента
// В будущем сюда можно будет добавлять заголовки (например, для авторизации)
export const graphQLClient = new GraphQLClient(endpoint || '', {
    // Пример добавления заголовка (пока закомментирован)
    // headers: () => {
    //   const token = localStorage.getItem('authToken'); // Пример получения токена
    //   return token ? { Authorization: `Bearer ${token}` } : {};
    // },
});

// Можно также экспортировать функцию для выполнения запросов, если нужно больше логики
// export const fetcher = <TData, TVariables>(query: string, variables?: TVariables) => {
//   return graphQLClient.request<TData, TVariables>(query, variables);
// };