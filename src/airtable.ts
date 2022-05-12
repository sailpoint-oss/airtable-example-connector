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
            let recordArray: Array<AirtableAccount> = []
            for (let record of records) {
                recordArray.push(AirtableAccount.createWithRecords(record))
            }
            return recordArray
        }).catch(err => {
            throw new ConnectorError('unable to connect')
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
        }).catch(err => {3
            throw new ConnectorError('unable to connect')
        })
    }

    async getAllEntitlements(): Promise<AirtableEntitlement[]> {
        return this.airTableBase('Entitlements').select({
            view: 'Grid view'
        }).firstPage().then(records => {
            let recordArray: Array<AirtableEntitlement> = []
            for (let record of records) {
                recordArray.push(new AirtableEntitlement(record))
            }
            return recordArray
        }).catch(err => {
            throw new ConnectorError('unable to connect')
        })
    }

    async getAccount(identity: SimpleKeyType | CompoundKeyType): Promise<AirtableAccount> {
        const id = <SimpleKeyType>identity

        return this.airTableBase('Users').select({
            view: 'Grid view',
            filterByFormula: `({Id} = '${id.simple.id}')`
        }).firstPage().then(records => {
            let recordArray: Array<AirtableAccount> = []
            for (let record of records) {
                recordArray.push(AirtableAccount.createWithRecords(record))
            }
            return recordArray[0]
        }).catch(err => {
            throw new ConnectorError('unable to connect')
        })
    }

    async deleteAccount(airTableid: string): Promise<{}> {
        return this.airTableBase('Users').destroy(airTableid,
        ).then((record) => {
            return {}
        }).catch(err => {
            throw new ConnectorError('unable to connect')
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
            throw new ConnectorError('unable to connect')
        })

    }

    async getEntitlement(identity: SimpleKeyType | CompoundKeyType): Promise<AirtableEntitlement> {
        const id = <SimpleKeyType>identity

        return this.airTableBase('Entitlements').select({
            view: 'Grid view',
            filterByFormula: `({Id} = '${id.simple.id}')`
        }).firstPage().then(records => {
            let recordArray: Array<AirtableEntitlement> = [] 
            for (let record of records) {
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
