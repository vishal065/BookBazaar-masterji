import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import EnvSecret from '../constants/envVariables';


const neonConnectionString = EnvSecret.DATABASE_URL;

// Initialize the connection pool with Neon DB connection string
const pool = new Pool({
    connectionString: neonConnectionString,

});

// Drizzle ORM setup with the pool
const db = drizzle(pool);


export { db }




//TODO for local connection
// // Initialize the connection pool with `pg`
// const pool = new Pool({
//     user: 'yourUsername',        // your PostgreSQL username
//     host: 'localhost',           // your PostgreSQL host (localhost for local)
//     database: 'yourDatabaseName', // your PostgreSQL database name
//     password: 'yourPassword',    // your PostgreSQL password
//     port: 5432,                  // your PostgreSQL port (default is 5432)
// });