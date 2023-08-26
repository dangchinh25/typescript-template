import {
    Either, success, error
} from '../../types';
import { ResourceError } from '../../errors';
import { externalFieldValidator } from './requestValidator.helper';
import {
    ExternalFieldValidationDataFetchError,
    ExternalFieldValidationError
} from './requestValidator.errors';


describe( 'externalFieldValidator', () => {
    interface State {
        id: number;
        name: string;
    }

    const funcitonalFnToFetchExternalData = async (): Promise<Either<ResourceError, State[]>> => {
        const states: State[] = [
            {
                id: 1,
                name: 'Pending'
            },
            {
                id: 2,
                name: 'Completed'
            }
        ];
        return success( states );
    };

    const nonFunctionalFnToFetchExternalData = async (): Promise<Either<ResourceError, State[]>> => {
        return error( new ResourceError( { message: 'Nope' } ) );
    };


    it(
        'returns given value when it is valid.',
        async () => {
            const givenValue = 'Pending';
            const externalFieldValidatorResult = await externalFieldValidator(
                funcitonalFnToFetchExternalData,
                'name',
                'state name',
                givenValue
            );

            expect( externalFieldValidatorResult )
                .toBe( givenValue );
        }
    );

    it(
        'throws proper error when fails to fetch external data.',
        async () => {
            const givenValue = 'Pending';

            const validatorCall = async () => {
                await externalFieldValidator(
                    nonFunctionalFnToFetchExternalData,
                    'name',
                    'state name',
                    givenValue
                );
            };

            await expect( validatorCall() )
                .rejects
                .toThrow( ExternalFieldValidationDataFetchError );
        }
    );

    it(
        'throws proper error when given invalid value.',
        async () => {
            const givenValue = 'Cancelled';

            const validatorCall = async () => {
                await externalFieldValidator(
                    funcitonalFnToFetchExternalData,
                    'name',
                    'state name',
                    givenValue
                );
            };

            await expect( validatorCall() )
                .rejects
                .toThrow( ExternalFieldValidationError );
        }
    );

    it(
        'throws proper error with valid values when given invalid value.',
        async () => {
            const givenValue = 'Cancelled';

            const validatorCall = async () => {
                await externalFieldValidator(
                    funcitonalFnToFetchExternalData,
                    'name',
                    'state name',
                    givenValue
                );
            };

            await expect( validatorCall() )
                .rejects
                .toHaveProperty( 'validValues' );
        }
    );

} );
