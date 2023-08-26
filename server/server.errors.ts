import { ResourceError } from '../errors';

export class ServerInternalError extends ResourceError {
    public constructor ( message?: string, error?: Error | unknown ) {
        if ( !message ) {
            message = 'The server encountered an unspecified internal error.';
        }

        const statusCode = 500;
        super( { message, error, statusCode } );
    }
}

export class RouteNotFoundError extends ResourceError {
    public constructor () {
        const message = 'This route does not exist.';
        const statusCode = 404;
        super( { message, statusCode } );
    }
}