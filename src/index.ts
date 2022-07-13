import {
    AttributeChange,
    AttributeChangeOp,
    ConnectorError,
    Context,
    createConnector,
    readConfig,
    Response,
    StdAccountCreateInput,
    StdAccountCreateOutput,
    StdAccountDeleteInput,
    StdAccountDeleteOutput,
    StdAccountDisableInput,
    StdAccountDisableOutput,
    StdAccountDiscoverSchemaOutput,
    StdAccountEnableInput,
    StdAccountEnableOutput,
    StdAccountListOutput,
    StdAccountReadInput,
    StdAccountReadOutput,
    StdAccountUnlockInput,
    StdAccountUnlockOutput,
    StdAccountUpdateInput,
    StdAccountUpdateOutput,
    StdEntitlementListInput,
    StdEntitlementListOutput,
    StdEntitlementReadInput,
    StdEntitlementReadOutput,
    StdTestConnectionOutput,
} from '@sailpoint/connector-sdk'
import { AirtableClient } from './airtable'

// Connector must be exported as module property named connector
export const connector = async () => {

    // Get connector source config
    const config = await readConfig()

    // Use the vendor SDK, or implement own client as necessary, to initialize a client
    const airtable = new AirtableClient(config)

    return createConnector()
        .stdTestConnection(async (context: Context, input: undefined, res: Response<StdTestConnectionOutput>) => {
            res.send(await airtable.testConnection())
        })
        .stdAccountList(async (context: Context, input: undefined, res: Response<StdAccountListOutput>) => {
            const accounts = await airtable.getAllAccounts()

            for (const account of accounts) {
                res.send(account.toStdAccountListOutput())
            }
        })
        .stdAccountRead(async (context: Context, input: StdAccountReadInput, res: Response<StdAccountReadOutput>) => {
            const account = await airtable.getAccount(input.key)

            res.send(account.toStdAccountReadOutput())
        })

        .stdAccountDiscoverSchema(async (context: Context, input: undefined, res: Response<StdAccountDiscoverSchemaOutput>) => {
            const account = await airtable.getAccountSchema()

            res.send(account)
        })

        .stdAccountCreate(async (context: Context, input: StdAccountCreateInput, res: Response<StdAccountCreateOutput>) => {
            if (!input.attributes.id) {
                throw new ConnectorError('identity cannot be null')
            }
            const user = await airtable.createAccount(input)

            res.send(user.toStdAccountCreateOutput())
        })

        .stdAccountDelete(async (context: Context, input: StdAccountDeleteInput, res: Response<StdAccountDeleteOutput>) => {
            const account = await airtable.getAccount(input.key)
            res.send(await airtable.deleteAccount(account.airtableId))
        })
        
        .stdEntitlementList(async (context: Context, input: StdEntitlementListInput, res: Response<StdEntitlementListOutput>) => {
            const groups = await airtable.getAllEntitlements()

            for (const group of groups) {
                res.send(group.toStdEntitlementListOutput())
            }
        })
        .stdEntitlementRead(async (context: Context, input: StdEntitlementReadInput, res: Response<StdEntitlementReadOutput>) => {
            const group = await airtable.getEntitlement(input.key)

            res.send(group.toStdEntitlementReadOutput())
        })

        .stdAccountUpdate(async (context: Context, input: StdAccountUpdateInput, res: Response<StdAccountUpdateOutput>) => {
            let account = await airtable.getAccount(input.key)
            for (const changes of input.changes) {
                account = await airtable.changeAccount(account, changes)
            }

            res.send(account.toStdAccountUpdateOutput())
        })

        
        .stdAccountDisable(async (context: Context, input: StdAccountDisableInput, res: Response<StdAccountDisableOutput>) => {
            let account = await airtable.getAccount(input.key)
            const change: AttributeChange = {
                op: AttributeChangeOp.Set,
                attribute: 'enabled',
                value: 'false'
            }
            account = await airtable.changeAccount(account, change)
            res.send(account.toStdAccountDisableOutput())
        })

        .stdAccountEnable(async (context: Context, input: StdAccountEnableInput, res: Response<StdAccountEnableOutput>) => {
            let account = await airtable.getAccount(input.key)
            const change: AttributeChange = {
                op: AttributeChangeOp.Set,
                attribute: 'enabled',
                value: 'true'
            }
            account = await airtable.changeAccount(account, change)
            res.send(account.toStdAccountEnableOutput())
        })

        .stdAccountUnlock(async (context: Context, input: StdAccountUnlockInput, res: Response<StdAccountUnlockOutput>) => {
            let account = await airtable.getAccount(input.key)
            const change: AttributeChange = {
                op: AttributeChangeOp.Set,
                attribute: 'locked',
                value: 'false'
            }
            account = await airtable.changeAccount(account, change)
            res.send(account.toStdAccountUnlockOutput())
        })
}
