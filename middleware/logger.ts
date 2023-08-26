import {
    Express, Request, Response, NextFunction
} from 'express';
import winston from 'winston';
import expressWinston from 'express-winston';
import { v4 as uuid } from 'uuid';
import cls from 'cls-hooked';
import util from 'util';
import { env } from '../config';

const clsNamespace = cls.createNamespace( 'context-ask-gpt' );

/*
 * winston format combine here?
 * https://docs.newrelic.com/docs/logs/enable-logs/logs-context-node/nodejs-configure-winston
 */
const myFormat = winston.format.printf( ( { level, message } ) => {
    let requestId = clsNamespace.get( 'requestId' ) || '';

    if ( requestId ) {
        requestId = ` Request id: ${ requestId } |`;
    }

    return `${ level }:${ requestId } ${ message }`;
} );

const filteredInputString = 'JSON.stringify( Object.keys( Object.assign( req.body, req.params, req.query ) ).filter( k => ![ \'w9Info\', \'ssnFirst3\', \'ssnMiddle2\', \'ssnLast4\', \'accountNumber\', \'routingNumber\', \'password\', \'signatureBase64\', \'profilePicture\', \'dob\', \'ssn\' ].includes( k ) ).map( k => Object.assign( {}, { [ k ]: Object.assign( req.body, req.params, req.query )[ k ] } ) ).reduce( ( res, o ) => Object.assign( res, o ), {} ) )';

const formatArgs = ( args ) => {
    return [
        util.format.apply(
            util.format,
            Array.prototype.slice.call( args )
        )
    ];
};

const customRequestFilter = ( req, propName ) => {
    console.log( req, propName );

    if ( propName === 'body'
        || propName === 'params'
        || propName === 'query' ) {
        const blacklist = [
            'accountNumber',
            'routingNumber',
            'password',
            'signatureBase64',
            'profilePicture'
        ];

        for ( const prop in req[ propName ] ) {
            if ( blacklist.indexOf( prop ) !== -1 ) {
                delete req[ propName ][ prop ];
            }
        }

        if ( propName === 'headers' ) {
            return Object.keys( req.headers )
                .reduce( function ( filteredHeaders, key ) {
                    if ( key !== 'authorization' ) {
                        filteredHeaders[ key ] = req.headers[ key ];
                    }

                    return filteredHeaders;
                }, {} );
        }
    }

    return req[ propName ];
};

const logResponseBody = ( req, res, next ) => {
    const oldWrite = res.write,
        oldEnd = res.end;

    const chunks: Buffer[] = [];

    res.write = function ( chunk ) {
        chunks.push( Buffer.from( chunk ) );

        oldWrite.apply( res, arguments );
    };

    res.end = function ( chunk ) {
        if ( chunk )
            chunks.push( Buffer.from( chunk ) );

        let body = Buffer.concat( chunks )
            .toString( 'utf8' );

        if ( body.length > 2000 ) {
            const bodyTrunc = body.slice( 0, 2000 );
            body = `${ bodyTrunc }...`;
        }

        res.vryLogger = {};
        res.vryLogger.body = body;

        oldEnd.apply( res, arguments );
    };

    next();
};

const shouldSkipRequestLog = (
    req: Request
): boolean => {

    if ( req.path === '/leafiness/liveness' )
        return true;
    if ( req.path === '/leafiness/readiness' )
        return true;

    return false;
};

const requestNamespaceInit = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const filteredInput = JSON.stringify(
        Object.keys(
            Object.assign( req.body, req.params, req.query )
        )
            .filter( k =>
                ![
                    'accountNumber',
                    'routingNumber',
                    'password',
                    'signatureBase64',
                    'profilePicture'
                ].includes( k ) )
            .map( k => (
                { [ k ]: Object.assign( req.body, req.params, req.query )[ k ] }
            ) )
            .reduce( ( res, o ) => Object.assign( res, o ), {} )
    );

    if ( !req.headers[ 'x-request-id' ] ) {
        req.headers[ 'x-request-id' ] = uuid();
    }

    clsNamespace.run( () => {
        if ( shouldSkipRequestLog( req ) ) {
            next();
            return;
        }

        clsNamespace.set( 'requestId', req.headers[ 'x-request-id' ] );

        // console.info( `INIT: ${ req.method } ${ req.path } | Input: ${ filteredInput }` );

        next();
    } );
};


const overrideConsoleDot = () => {

    const logger = winston.createLogger( {
        level: env.LOG_LEVEL,
        transports: [
            new winston.transports.Console( {
                format: winston.format.combine(

                    // winston.format.colorize(),
                    winston.format.simple(),
                    winston.format.timestamp(),
                    myFormat
                )
            } )
        ]
    } );

    console.log = ( ...args ) => {
        logger.info( formatArgs( args ) );
    };

    console.info = ( ...args ) => {
        logger.info( formatArgs( args ) );
    };

    console.warn = ( ...args ) => {
        logger.warn( formatArgs( args ) );
    };

    console.error = ( ...args ) => {
        logger.error( formatArgs( args ) );
    };

    console.debug = ( ...args ) => {
        logger.debug( formatArgs( args ) );
    };

};

/**
 * This function completes the following:
 *
 * - Creates a namespace for each request that spans
 *   over the lifetime of the request
 * - Overrides console.[log,info,error,etc] to add
 *   a request id from the namespace to each log
 * - Logs the request as soon as it's received
 * - Logs the request when a response is returned
 */
export const requestLogger = ( app: Express ): void => {
    app.use( requestNamespaceInit );

    overrideConsoleDot();

    app.use( logResponseBody );
    expressWinston.bodyBlacklist.push( 'password', 'profilePicture' );
    expressWinston.responseWhitelist.push( 'body' );

    app.use( expressWinston.logger( {
        transports: [ new winston.transports.Console() ],
        format: winston.format.combine(

            // winston.format.colorize(),
            winston.format.simple(),
            winston.format.timestamp(),
            myFormat
        ),
        msg: `{{ res.statusCode }} Ran {{ req.method }} endpoint at {{ req.originalUrl }} in {{ res.responseTime }}ms. Input: | Response:`,
        level: 'info',
        meta: false,
        expressFormat: false,
        colorize: true,
        requestFilter: customRequestFilter,
        skip: shouldSkipRequestLog
    } ) );
};

export const initJobLogger = (): void => {
    process.env.WORKLOAD_RUN_ID = uuid();

    clsNamespace.run( () => {
        clsNamespace.set( 'requestId', uuid() );

        overrideConsoleDot();
    } );
};