import neo4j, { Driver, Session } from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'recommendation123';
const database = process.env.NEO4J_DATABASE || 'neo4j';

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

    console.log(`[Neo4j] Driver initialized connecting to ${uri}`);
  }
  return driver;
};

export const getNeo4jSession = (): Session => {
  if (!driver) {
    initNeo4jDriver();
  }
  return driver.session({ database });
};

export const verifyNeo4jConnection = async (): Promise<boolean> => {
  try {
    const d = initNeo4jDriver();
    await d.verifyConnectivity();
    console.log('✅ [Neo4j] Connected successfully to database!');
    return true;
  } catch (error) {
    console.error('❌ [Neo4j] Connection failed:', error);
    return false;
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
