import { AttributeChange, CompoundKeyType, ConnectorError, ConnectorErrorType, SimpleKeyType, StdAccountCreateInput, StdAccountDiscoverSchemaOutput } from "@sailpoint/connector-sdk"
import { AirtableAccount } from "../models/AirtableAccount"
import { AirtableEntitlement } from "../models/AirtableEntitlement"
import crypto from "crypto"
import { InvalidConfigurationError } from "../errors/invalid-configuration-error"

export class AirtableClient {
    constructor(config: any) {
        // Fetch necessary properties from config.
        // Following properties actually do not exist in the config -- it just serves as an example.
        if (config.apiKey == null) {
            throw new InvalidConfigurationError('token must be provided from config')
        }
        if (config.airtableBase == null) {
            throw new InvalidConfigurationError('airtableBase base id needed')
        }
    }

    async getAllAccounts(): Promise<AirtableAccount[]> { 
            const recordArray: Array<AirtableAccount> = []
            const account = new AirtableAccount()
            account.displayName = "Test User"
            account.email = "test@test.com"
            account.id = "1234"
            account.enabled = true
            account.locked = false
            account.department = "accounting"
            account.firstName = "test"
            account.lastName = "user"
            account.password = "password1234"
            account.entitlments = ["ent1", "ent2"] 
            recordArray.push(account)
            return recordArray
    }

    async changeAccount(account: AirtableAccount, changes: AttributeChange): Promise<AirtableAccount> {
        account.updateFieldByName(changes.attribute, changes.value, changes.op)

        return account
    }

    async getAllEntitlements(): Promise<AirtableEntitlement[]> {

            const recordArray: Array<AirtableEntitlement> = []
            const entitlement = new AirtableEntitlement()
            entitlement.id = "4321"
            entitlement.name = "superuser"
            recordArray.push(entitlement)
            return recordArray

    }

    async getAccount(identity: SimpleKeyType | CompoundKeyType): Promise<AirtableAccount> {
        const id = <SimpleKeyType>identity

        const account = new AirtableAccount()
        account.displayName = "Test User"
        account.email = "test@test.com"
        account.id = "1234"
        account.enabled = true
        account.locked = false
        account.department = "accounting"
        account.firstName = "test"
        account.lastName = "user"
        account.password = "password1234"
        account.entitlments = ["ent1", "ent2"] 

        if (id.simple.id === "1234") {
            return account
        } else {
            throw new ConnectorError("Account not found", ConnectorErrorType.NotFound)
        }
        
    }

    async getAccountSchema(): Promise<StdAccountDiscoverSchemaOutput> {
            const recordArray: StdAccountDiscoverSchemaOutput = {
                "identityAttribute": 'email',
                "displayAttribute": 'id',
                "groupAttribute": 'entitlments',
                "attributes": []
            }
            recordArray.attributes = []
                const fieldset = new AirtableAccount
                for (const [key] of Object.entries(fieldset)) {
                    if (key === 'entitlements') {
                        recordArray.attributes.push(
                            {
                                "name": key,
                                "description": key,
                                "type": "string",
                                "entitlement": true,
                                "managed": true,
                                "multi": true
                            }
                        )
                    } else {
                        recordArray.attributes.push(
                            {
                                "name": key,
                                "description": key,
                                "type": "string"
                            }
                        )
                    }
                }
            return recordArray
    }

    async deleteAccount(airTableid: string): Promise<Record<string, never>> {
        return {}
    }

    async createAccount(input: StdAccountCreateInput): Promise<AirtableAccount> {

        const account = new AirtableAccount()
        account.displayName = "Test User"
        account.email = "test@test.com"
        account.id = "1234"
        account.enabled = true
        account.locked = false
        account.department = "accounting"
        account.firstName = "test"
        account.lastName = "user"
        account.password = "password1234"
        account.entitlments = ["ent1", "ent2"] 

        return account


    }

    async getEntitlement(identity: SimpleKeyType | CompoundKeyType): Promise<AirtableEntitlement> {

            const entitlement = new AirtableEntitlement()
            entitlement.id = "4321"
            entitlement.name = "superuser"

            return entitlement
    }

    async testConnection(): Promise<any> {
        return {}

    }
}
