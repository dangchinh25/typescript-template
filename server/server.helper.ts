import {
    NextFunction, Request, Response
} from 'express';
import { ResourceError } from '../errors';
import { RouteNotFoundError, ServerInternalError } from './server.errors';

/**
 * This wrapper function handles error handling for internal server (code 500)
 */
export const wrapAsync = <Q = unknown, S = unknown>(
    fn: (
        req: Request<Q>
        , res: Response<S>
        , next: NextFunction
    ) => Promise<Response<S>>
) => (
        req: Request<Q>,
        res: Response<S | ServerInternalError>,
        next: NextFunction
    ): void => {
        fn( req, res, next )
            .catch( ( error: Error ) => {
                console.error( error );
                const internalError = new ServerInternalError(
                    undefined,
                    { message: error.message }
                );
                return res.status( internalError.statusCode )
                    .json( internalError );
            } );
    };


export const serverErrorHandler = (
    err: ResourceError,
    req: Request,
    res: Response<ResourceError>,

    /**
     * To recognize the error handler middleware,
     * Express counts the one with 4 arguments. Even
     * though we do not need the 'next' argument, we need
     * to keep it here.
     */
    next: NextFunction
): Response<ResourceError> => {
    const internalError = new ServerInternalError( undefined, err );
    return res
        .status( internalError.statusCode )
        .json( internalError );
};

export const clientErrorHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): Response<ResourceError> | void => {
    if ( req.xhr || !req.route ) {
        const internalError = new RouteNotFoundError();
        return res
            .status( internalError.statusCode )
            .json( internalError );
    } else {
        return next( req );
    }
};
