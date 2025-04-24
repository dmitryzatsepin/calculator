// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  // URL вашего GraphQL эндпоинта
  schema: "http://localhost:5000/api/v1", // <--- ЗАМЕНИТЕ, ЕСЛИ НУЖНО
  documents: "src/**/*.tsx",
  generates: {
    "src/generated/graphql/": {
       preset: "client",
       plugins: [],
       presetConfig: {
         gqlTagName: 'gql'
       },
        config: {
          fragmentMasking: false,
        },
    }
  },
  ignoreNoDocuments: true,
};

export default config;