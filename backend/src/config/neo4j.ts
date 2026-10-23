import neo4j, { Driver, Session } from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const clean = (val?: string): string => (val || '').trim().replace(/^["']|["']$/g, '');

const normalizeUri = (rawUri?: string): string => {
  const cleaned = clean(rawUri);
  if (!cleaned) return 'bolt://localhost:7687';
  if (!cleaned.includes('://')) {
    return `neo4j+s://${cleaned}`;
  }
  return cleaned;
};

const uri = normalizeUri(process.env.NEO4J_URI);
const user = clean(process.env.NEO4J_USER || process.env.NEO4J_USERNAME) || 'neo4j';
const password = clean(process.env.NEO4J_PASSWORD) || 'recommendation123';
const database = clean(process.env.NEO4J_DATABASE) || undefined;

let driver: Driver;

export const initNeo4jDriver = (): Driver => {
  if (!driver) {
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
      maxConnectionPoolSize: 50,
      connectionAcquisitionTimeout: 30000,
      logging: {
        level: 'warn',
        logger: (level, message) => console.log(`[Neo4j ${level}] ${message}`),
      },
    });

    console.log(`[Neo4j] Driver initialized connecting to ${uri.replace(/:[^:@]+@/, ':****@')}`);
  }
  return driver;
};

export const getNeo4jSession = (): Session => {
  if (!driver) {
    initNeo4jDriver();
  }
  return driver.session(database ? { database } : {});
};

export const getNeo4jConfig = () => ({
  uri: uri.replace(/:[^:@]+@/, ':****@'),
  user,
  database: database || '(default)',
  isDefaultLocal: uri.includes('localhost') || uri.includes('127.0.0.1'),
});

export const verifyNeo4jConnection = async (): Promise<{ connected: boolean; uri: string; error?: string }> => {
  try {
    const d = initNeo4jDriver();
    await d.verifyConnectivity();
    console.log('✅ [Neo4j] Connected successfully to database!');
    return { connected: true, uri: uri.replace(/:[^:@]+@/, ':****@') };
  } catch (error: any) {
    console.error('❌ [Neo4j] Connection failed:', error?.message || error);
    return {
      connected: false,
      uri: uri.replace(/:[^:@]+@/, ':****@'),
      error: error?.message || String(error),
    };
  }
};

export const closeNeo4jDriver = async (): Promise<void> => {
  if (driver) {
    await driver.close();
    console.log('[Neo4j] Driver closed.');
  }
};

// Helper: Convert Neo4j integers / objects recursively to standard JS numbers / strings
export const neo4jToPlain = (value: any): any => {
  if (value === null || value === undefined) {
    return value;
  }

  // Check for Neo4j Integer
  if (neo4j.isInt(value)) {
    return value.inSafeRange() ? value.toNumber() : value.toString();
  }

  // Check for Array
  if (Array.isArray(value)) {
    return value.map(neo4jToPlain);
  }

  // Check for Neo4j Node / Relationship
  if (typeof value === 'object') {
    if ('properties' in value && typeof value.properties === 'object') {
      return neo4jToPlain(value.properties);
    }

    const plainObj: Record<string, any> = {};
    for (const key of Object.keys(value)) {
      plainObj[key] = neo4jToPlain(value[key]);
    }
    return plainObj;
  }

  return value;
};
