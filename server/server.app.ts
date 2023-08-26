import express from 'express';
import { clientErrorHandler, serverErrorHandler } from './server.helper';
import cors from 'cors';
import { requestLogger } from '../middleware';

export const app = express();

app.use( express.json() );
app.use( cors() );
requestLogger( app );

/**
 * Routes
 */

/**
 * Error Handling
 */
app.use( clientErrorHandler );
app.use( serverErrorHandler );
