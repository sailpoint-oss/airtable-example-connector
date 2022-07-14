import { AttributeChange, CompoundKeyType, ConnectorError, ConnectorErrorType, SimpleKeyType, StdAccountCreateInput, StdAccountDiscoverSchemaOutput } from "@sailpoint/connector-sdk"
import { AirtableAccount } from "../models/AirtableAccount"
import { AirtableEntitlement } from "../models/AirtableEntitlement"
import { InvalidConfigurationError } from "../errors/invalid-configuration-error"
import accountJson from "./account.json"
import entitlementJson from "./entitlement.json"
import schemaJson from "./schema.json"

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
        const account = Object.assign(new AirtableAccount(), accountJson)
        recordArray.push(account)
        return recordArray
    }

    async changeAccount(account: AirtableAccount, changes: AttributeChange): Promise<AirtableAccount> {
        account.updateFieldByName(changes.attribute, changes.value, changes.op)

        return account
    }

    async getAllEntitlements(): Promise<AirtableEntitlement[]> {

            const recordArray: Array<AirtableEntitlement> = []
            const entitlement = Object.assign(new AirtableEntitlement(), entitlementJson)
            recordArray.push(entitlement)
            return recordArray

    }

    async getAccount(identity: SimpleKeyType | CompoundKeyType): Promise<AirtableAccount> {
        const id = <SimpleKeyType>identity

        const account = Object.assign(new AirtableAccount(), accountJson)
        if (id.simple.id === "1234") {
            return account
        } else {
            throw new ConnectorError("Account not found", ConnectorErrorType.NotFound)
        }
        
    }

    async getAccountSchema(): Promise<StdAccountDiscoverSchemaOutput> {
            return schemaJson
    }

    async deleteAccount(airTableid: string): Promise<Record<string, never>> {
        return {}
    }

    async createAccount(input: StdAccountCreateInput): Promise<AirtableAccount> {
        return Object.assign(new AirtableAccount(), accountJson)
    }

    async getEntitlement(identity: SimpleKeyType | CompoundKeyType): Promise<AirtableEntitlement> {
            return Object.assign(new AirtableEntitlement(), entitlementJson)
    }

    async testConnection(): Promise<any> {
        return {}
    }
}
