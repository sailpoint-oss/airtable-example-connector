import { AttributeChange, CompoundKeyType, ConnectorError, ConnectorErrorType, SimpleKeyType, StdAccountCreateInput, StdAccountDiscoverSchemaOutput } from "@sailpoint/connector-sdk"
import Airtable from "airtable/lib/airtable"
import { AirtableAccount } from "./models/AirtableAccount"
import { AirtableEntitlement } from "./models/AirtableEntitlement"
import crypto from "crypto"
import { InvalidConfigurationError } from "./errors/invalid-configuration-error"

export class AirtableClient {
    private readonly airTableBase: Airtable.Base
    constructor(config: any) {
        // Fetch necessary properties from config.
        // Following properties actually do not exist in the config -- it just serves as an example.
        if (config.apiKey == null) {
            throw new InvalidConfigurationError('token must be provided from config')
        }
        if (config.airtableBase == null) {
            throw new InvalidConfigurationError('airtableBase base id needed')
        }
        Airtable.configure({apiKey: config.apiKey})
        this.airTableBase = Airtable.base(config.airtableBase)
    }

    async getAllAccounts(): Promise<AirtableAccount[]> {
        return this.airTableBase('Users').select({
            view: 'Grid view'
        }).firstPage().then(records => {
            const recordArray: Array<AirtableAccount> = []
            for (const record of records) {
                recordArray.push(AirtableAccount.createWithRecords(record))
            }
            return recordArray
        }).catch(err => {
            throw new ConnectorError('error while getting accounts: ' + err)
        })
    }

    async changeAccount(account: AirtableAccount, changes: AttributeChange): Promise<AirtableAccount> {
        account.updateFieldByName(changes.attribute, changes.value, changes.op)

        return this.airTableBase('Users').update(account.airtableId, {
            "displayName": account.displayName,
            "email": account.email,
            "id": account.id,
            "enabled": account.enabled ? 'true' : 'false',
            "locked": account.locked ? 'true' : 'false',
            "department": account.department,
            "firstName": account.firstName,
            "lastName": account.lastName,
            "password": account.password,
            "entitlements": account.entitlments.join(',') 
        }).then(record =>{
            const airtableRecord = AirtableAccount.createWithRecords(record)
            return airtableRecord
        }).catch(err => {
            throw new ConnectorError('error while changing accounts: ' + err)
        })
    }

    async getAllEntitlements(): Promise<AirtableEntitlement[]> {
        return this.airTableBase('Entitlements').select({
            view: 'Grid view'
        }).firstPage().then(records => {
            const recordArray: Array<AirtableEntitlement> = []
            for (const record of records) {
                recordArray.push(AirtableEntitlement.createWithRecords(record))
            }
            return recordArray
        }).catch(err => {
            throw new ConnectorError('error while getting entitlements: ' + err)
        })
    }

    async getAccount(identity: SimpleKeyType | CompoundKeyType): Promise<AirtableAccount> {
        const id = <SimpleKeyType>identity
        let found = false

        return this.airTableBase('Users').select({
            view: 'Grid view',
            filterByFormula: `({id} = '${id.simple.id}')`
        }).firstPage().then(records => {
            const recordArray: Array<AirtableAccount> = []
            for (const record of records) {
                found = true
                recordArray.push(AirtableAccount.createWithRecords(record))
            }
            return recordArray[0]
        }).catch(err => {
            throw new ConnectorError('error while getting account: ' + err)
        }).finally(() => {
            if (!found) {
                throw new ConnectorError("Account not found", ConnectorErrorType.NotFound)
            }
        })
    }

    async getAccountSchema(): Promise<StdAccountDiscoverSchemaOutput> {
        return this.airTableBase('Users').select({
            view: 'Grid view'
        }).firstPage().then(records => {
            const recordArray: StdAccountDiscoverSchemaOutput = {
                "identityAttribute": 'email',
                "displayAttribute": 'id',
                "groupAttribute": 'entitlments',
                "attributes": []
            }
            recordArray.attributes = []
            for (const record of records) {
                const fieldset = record.fields
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
                break
            }
            return recordArray
        }).catch(err => {
            throw new ConnectorError('error while getting accounts: ' + err)
        })
    }

    async deleteAccount(airTableid: string): Promise<Record<string, never>> {
        return this.airTableBase('Users').destroy(airTableid,
        ).then(() => {
            return {}
        }).catch(err => {
            throw new ConnectorError('error while deleting account: ' + err)
        })
    }

    async createAccount(input: StdAccountCreateInput): Promise<AirtableAccount> {
        const account = AirtableAccount.createWithStdAccountCreateInput(input);

        return this.airTableBase('Users').create({
            "displayName": account.displayName,
            "email": account.email,
            "id": account.id,
            "enabled": account.enabled ? 'true' : 'false',
            "department": account.department,
            "firstName": account.firstName,
            "lastName": account.lastName,
            "locked": account.locked ? 'true' : 'false',
            "password": account.password ? account.password : crypto.randomBytes(20).toString('hex'),
            "entitlements": account.entitlments.join(',') 
        }).then(record => {
            const airtableRecord = AirtableAccount.createWithRecords(record)
            return airtableRecord
        }).catch(err => {
            throw new ConnectorError('error while getting accounts: ' + err)
        })

    }

    async getEntitlement(identity: SimpleKeyType | CompoundKeyType): Promise<AirtableEntitlement> {
        const id = <SimpleKeyType>identity
        let found = false

        return this.airTableBase('Entitlements').select({
            view: 'Grid view',
            filterByFormula: `({Id} = '${id.simple.id}')`
        }).firstPage().then(records => {
            const recordArray: Array<AirtableEntitlement> = [] 
            for (const record of records) {
                found = true
                recordArray.push(AirtableEntitlement.createWithRecords(record))
            }
            return recordArray[0]
        }).catch(err => {
            throw new ConnectorError('unable to connect')
        }).finally(() => {
            if (!found) {
                throw new ConnectorError('Entitlement not found')
            }
        })
    }

    async testConnection(): Promise<any> {
        return this.airTableBase('Users').select({
            view: 'Grid view'
        }).firstPage().then(records => {
            return {}
        }).catch(err => {
            throw new ConnectorError('unable to connect')
        })
    }
}
