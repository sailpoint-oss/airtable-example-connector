import { ConnectorError, ConnectorErrorType } from '@sailpoint/connector-sdk'

/**
 * Thrown when an application missing configuration during initialization
 */

export class InvalidConfigurationError extends ConnectorError {
    /**
     * Constructor
     * @param message Error message
     * @param type ConnectorErrorType they type of error
     */
    constructor(message: string, type?: ConnectorErrorType) {
        super(message, type)
        this.name = 'InvalidConfigurationError'
    }
}