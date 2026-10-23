"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.neo4jToPlain = exports.closeNeo4jDriver = exports.verifyNeo4jConnection = exports.getNeo4jSession = exports.initNeo4jDriver = void 0;
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'recommendation123';
const database = process.env.NEO4J_DATABASE || 'neo4j';
let driver;
const initNeo4jDriver = () => {
    if (!driver) {
        driver = neo4j_driver_1.default.driver(uri, neo4j_driver_1.default.auth.basic(user, password), {
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
exports.initNeo4jDriver = initNeo4jDriver;
const getNeo4jSession = () => {
    if (!driver) {
        (0, exports.initNeo4jDriver)();
    }
    return driver.session({ database });
};
exports.getNeo4jSession = getNeo4jSession;
const verifyNeo4jConnection = async () => {
    try {
        const d = (0, exports.initNeo4jDriver)();
        await d.verifyConnectivity();
        console.log('✅ [Neo4j] Connected successfully to database!');
        return true;
    }
    catch (error) {
        console.error('❌ [Neo4j] Connection failed:', error);
        return false;
    }
};
exports.verifyNeo4jConnection = verifyNeo4jConnection;
const closeNeo4jDriver = async () => {
    if (driver) {
        await driver.close();
        console.log('[Neo4j] Driver closed.');
    }
};
exports.closeNeo4jDriver = closeNeo4jDriver;
// Helper: Convert Neo4j integers / objects recursively to standard JS numbers / strings
const neo4jToPlain = (value) => {
    if (value === null || value === undefined) {
        return value;
    }
    // Check for Neo4j Integer
    if (neo4j_driver_1.default.isInt(value)) {
        return value.inSafeRange() ? value.toNumber() : value.toString();
    }
    // Check for Array
    if (Array.isArray(value)) {
        return value.map(exports.neo4jToPlain);
    }
    // Check for Neo4j Node / Relationship
    if (typeof value === 'object') {
        if ('properties' in value && typeof value.properties === 'object') {
            return (0, exports.neo4jToPlain)(value.properties);
        }
        const plainObj = {};
        for (const key of Object.keys(value)) {
            plainObj[key] = (0, exports.neo4jToPlain)(value[key]);
        }
        return plainObj;
    }
    return value;
};
exports.neo4jToPlain = neo4jToPlain;
