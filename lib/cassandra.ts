import { Client, types, QueryOptions } from 'cassandra-driver';
import { DatabaseResult } from './types';

// Initialize Cassandra client
const client = new Client({
  contactPoints: [process.env.CASSANDRA_CONTACT_POINT || 'localhost'],
  localDataCenter: process.env.CASSANDRA_LOCAL_DC || 'datacenter1',
  keyspace: process.env.CASSANDRA_KEYSPACE || 'vicharcha',
  credentials: {
    username: process.env.CASSANDRA_USERNAME || 'cassandra',
    password: process.env.CASSANDRA_PASSWORD || 'cassandra'
  }
});

export async function connect() {
  try {
    await client.connect();
    console.log('Connected to Cassandra');
  } catch (error) {
    console.error('Error connecting to Cassandra:', error);
    throw error;
  }
}

export async function disconnect() {
  await client.shutdown();
  console.log('Disconnected from Cassandra');
}

export async function executeQuery<T = types.Row>(
  query: string,
  params?: unknown[],
  options: QueryOptions = { prepare: true }
): Promise<DatabaseResult<T>> {
  try {
    const result = await client.execute(query, params, options);
    return {
      success: true,
      rows: result.rows as T[],
      count: result.rowLength
    };
  } catch (error) {
    console.error('Error executing query:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export { client };
