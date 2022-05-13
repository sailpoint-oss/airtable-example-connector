import { AttributeChange, CompoundKeyType, ConnectorError, SimpleKeyType, StdAccountCreateInput } from "@sailpoint/connector-sdk"
import Airtable from "airtable/lib/airtable"
import { AirtableAccount } from "./models/AirtableAccount"
import { AirtableEntitlement } from "./models/AirtableEntitlement"

export class AirtableClient {
    private readonly airTableBase: Airtable.Base
    constructor(config: any) {
        // Fetch necessary properties from config.
        // Following properties actually do not exist in the config -- it just serves as an example.
        if (config.apiKey == null) {
            throw new ConnectorError('token must be provided from config')
        }
        if (config.airtableBase == null) {
            throw new ConnectorError('airtableBase base id needed')
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
                recordArray.push(new AirtableEntitlement(record))
            }
            return recordArray
        }).catch(err => {
            throw new ConnectorError('error while getting entitlements: ' + err)
        })
    }

    async getAccount(identity: SimpleKeyType | CompoundKeyType): Promise<AirtableAccount> {
        const id = <SimpleKeyType>identity

        return this.airTableBase('Users').select({
            view: 'Grid view',
            filterByFormula: `({Id} = '${id.simple.id}')`
        }).firstPage().then(records => {
            const recordArray: Array<AirtableAccount> = []
            for (const record of records) {
                recordArray.push(AirtableAccount.createWithRecords(record))
            }
            return recordArray[0]
        }).catch(err => {
            throw new ConnectorError('error while getting account: ' + err)
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
            "password": account.password,
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

        return this.airTableBase('Entitlements').select({
            view: 'Grid view',
            filterByFormula: `({Id} = '${id.simple.id}')`
        }).firstPage().then(records => {
            const recordArray: Array<AirtableEntitlement> = [] 
            for (const record of records) {
                recordArray.push(new AirtableEntitlement(record))
            }
            return recordArray[0]
        }).catch(err => {
            throw new ConnectorError('unable to connect')
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
