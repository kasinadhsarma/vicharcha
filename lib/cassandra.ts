import cassandraDriver from 'cassandra-driver';

const { Client } = cassandraDriver;

const cassandraHost = process.env.CASSANDRA_HOST || 'localhost';
const cassandraKeyspace = process.env.CASSANDRA_KEYSPACE || 'social_network';

export const cassandra = new Client({
  contactPoints: [cassandraHost],
  localDataCenter: 'datacenter1',
  keyspace: cassandraKeyspace,
});

export enum PostCategories {
  GENERAL = 'general',
  NEWS = 'news',
  ENTERTAINMENT = 'entertainment',
  SPORTS = 'sports',
  TECHNOLOGY = 'technology',
  POLITICS = 'politics',
  ADULT = 'adult',
}

export interface DatabaseResult<T = any> {
  success: boolean;
  error?: string;
  rows: T[];
  count?: number;
}

export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<DatabaseResult<T>> {
  try {
    const result = await cassandra.execute(query, params, { prepare: true });
    const rows = result.rows as unknown as T[];
    return {
      success: true,
      rows,
      count: rows.length
    };
  } catch (error) {
    console.error('Cassandra query error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database error',
      rows: [],
      count: 0
    };
  }
}

export async function executeBatch(queries: { query: string; params: any[] }[]): Promise<DatabaseResult> {
  try {
    const batch = queries.map(({ query, params }) => ({
      query,
      params
    }));

    await cassandra.batch(batch, { prepare: true });
    return {
      success: true,
      rows: [],
      count: 0
    };
  } catch (error) {
    console.error('Cassandra batch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Database error',
      rows: [],
      count: 0
    };
  }
}
