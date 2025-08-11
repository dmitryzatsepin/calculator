// API клиент для LED Calculator

const API_BASE = '/apps/led-calculator/api';

export class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  async graphql<T = any>(query: string, variables?: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        console.error('GraphQL errors:', result.errors);
        throw new Error(result.errors[0]?.message || 'GraphQL error');
      }

      return result.data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Проверка здоровья API
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Получение начальных данных
  async getInitialData() {
    const query = `
      fragment LocationFields on Location {
        id
        code
        name
        active
      }

      fragment MaterialFields on Material {
        id
        code
        name
        active
      }

      fragment SensorFields on Sensor {
        id
        code
        name
        active
      }

      fragment ControlTypeFields on ControlType {
        id
        code
        name
        active
      }

      query GetInitialData {
        screenTypes(onlyActive: true) {
          id
          code
          name
        }
        locations {
          ...LocationFields
        }
        materials {
          ...MaterialFields
        }
        ipProtections(onlyActive: true) {
          id
          code
        }
        sensors(onlyActive: true) {
          ...SensorFields
        }
        controlTypes(onlyActive: true) {
          ...ControlTypeFields
        }
      }
    `;

    return this.graphql(query);
  }
}

export const apiClient = new ApiClient(); 