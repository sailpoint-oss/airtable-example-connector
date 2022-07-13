import { logger as SDKLogger } from '@sailpoint/connector-sdk'

export const logger = SDKLogger.child(
    // specify your connector name
    { connectorName: 'Airtable' },
    // This is optional for  removing specific information you might not want to be logged
    {
        redact: {
            paths: [
                '*.password',
                '*.username',
                '*.email',
                '*.id',
                '*.firstName',
                '*.lastName',
                '*.displayName'
            ],
            censor: '****',
        },
    }
)