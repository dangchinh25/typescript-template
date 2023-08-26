import { ResourceError } from '../../errors';

export class RequestValidationError extends ResourceError {
    public constructor (
        schemaName: string,
        error: string | ResourceError
    ) {
        const message = `Error Validating the ${ schemaName } Request.`;
        const statusCode = 400;
        const code = 'REQUEST_VALIDATION';
        super( {
            message, code, error, statusCode
        } );
    }
}

export class ExternalFieldValidationError<T = unknown> extends ResourceError {
    validValues: T[ keyof T ][];

    public constructor (
        value: T[ keyof T ],
        validValues: T[ keyof T ][],
        datumAttributeDescription: string
    ) {
        const message = `${ value } is an invalid ${ datumAttributeDescription }.`;
        super( { message } );

        this.validValues = validValues;
    }
}

export class ExternalFieldValidationDataFetchError<T = unknown>
    extends ResourceError {

    public constructor (
        value: T[ keyof T ],
        datumAttributeDescription: string
    ) {
        const message = `${ value } might be an invalid ${ datumAttributeDescription }. We were unable to complete validation on this field.`;
        super( { message } );
    }
}