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
    StdAccountListInput,
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
import { logger } from './logger/logger';

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
        .stdAccountList(async (context: Context, input: StdAccountListInput, res: Response<StdAccountListOutput>) => {
            let accounts = []
            const state = {"data": Date.now().toString()}
            if (!input.state && input.stateful) {
                logger.info(input, "No state provided, fetching all accounts")
                accounts = await airtable.getAllAccounts()
            } else if (input.state && input.stateful) {
                logger.info(input ,"Current state provided, only fetching accounts after that state")
                accounts = await airtable.getAllStatefulAccounts(new Date(Number(input.state?.data)))
            } else {
                logger.info(input.state ,"Source is not stateful, getting all acounts")
                accounts = await airtable.getAllAccounts()
            }
            logger.info(accounts, "fetched the following accounts from Airtable")
            for (const account of accounts) {
                res.send(account.toStdAccountListOutput())
            }
            res.saveState(state)
        })
        .stdAccountRead(async (context: Context, input: StdAccountReadInput, res: Response<StdAccountReadOutput>) => {
            const account = await airtable.getAccount(input.key)
            logger.info(account, "fetched the following account from Airtable")
            res.send(account.toStdAccountReadOutput())
        })

        .stdAccountDiscoverSchema(async (context: Context, input: undefined, res: Response<StdAccountDiscoverSchemaOutput>) => {
            const schema = await airtable.getAccountSchema()
            logger.info(schema, "fetched the following Airtable schema")
            res.send(schema)
        })

        .stdAccountCreate(async (context: Context, input: StdAccountCreateInput, res: Response<StdAccountCreateOutput>) => {
            logger.info(input, "creating account using input")
            if (!input.identity) {
                throw new ConnectorError('identity cannot be null')
            }
            const user = await airtable.createAccount(input)
            logger.info(user, "created user in Airtable")
            res.send(user.toStdAccountCreateOutput())
        })

        .stdAccountDelete(async (context: Context, input: StdAccountDeleteInput, res: Response<StdAccountDeleteOutput>) => {
            const account = await airtable.getAccount(input.key)
            logger.info(account, "deleting user in Airtable")
            res.send(await airtable.deleteAccount(account.airtableId))
        })
        
        .stdEntitlementList(async (context: Context, input: StdEntitlementListInput, res: Response<StdEntitlementListOutput>) => {
            const groups = await airtable.getAllEntitlements()
            logger.info(groups, "fetched the following entitlements in Airtable")
            for (const group of groups) {
                res.send(group.toStdEntitlementListOutput())
            }
        })
        .stdEntitlementRead(async (context: Context, input: StdEntitlementReadInput, res: Response<StdEntitlementReadOutput>) => {
            const group = await airtable.getEntitlement(input.key)
            logger.info(group, "fetched the following entitlement in Airtable")
            res.send(group.toStdEntitlementReadOutput())
        })

        .stdAccountUpdate(async (context: Context, input: StdAccountUpdateInput, res: Response<StdAccountUpdateOutput>) => {
            logger.info(input, "getting account using input")
            let account = await airtable.getAccount(input.key)
            logger.info(account, "changing the following account in Airtable")
            for (const changes of input.changes) {
                account = await airtable.changeAccount(account, changes)
            }
            logger.info(account, "new account after changes applied")
            res.send(account.toStdAccountUpdateOutput())
        })

        
        .stdAccountDisable(async (context: Context, input: StdAccountDisableInput, res: Response<StdAccountDisableOutput>) => {
            let account = await airtable.getAccount(input.key)
            logger.info(account, "disabling the following account in Airtable")
            const change: AttributeChange = {
                op: AttributeChangeOp.Set,
                attribute: 'enabled',
                value: 'false'
            }
            account = await airtable.changeAccount(account, change)
            logger.info(account, "new account after changes applied")
            res.send(account.toStdAccountDisableOutput())
        })

        .stdAccountEnable(async (context: Context, input: StdAccountEnableInput, res: Response<StdAccountEnableOutput>) => {
            let account = await airtable.getAccount(input.key)
            logger.info(account, "enabling the following account in Airtable")
            const change: AttributeChange = {
                op: AttributeChangeOp.Set,
                attribute: 'enabled',
                value: 'true'
            }
            account = await airtable.changeAccount(account, change)
            logger.info(account, "new account after changes applied")
            res.send(account.toStdAccountEnableOutput())
        })

        .stdAccountUnlock(async (context: Context, input: StdAccountUnlockInput, res: Response<StdAccountUnlockOutput>) => {
            let account = await airtable.getAccount(input.key)
            logger.info(account, "unlocking the following account in Airtable")
            const change: AttributeChange = {
                op: AttributeChangeOp.Set,
                attribute: 'locked',
                value: 'false'
            }
            account = await airtable.changeAccount(account, change)
            logger.info(account, "new account after changes applied")
            res.send(account.toStdAccountUnlockOutput())
        })
}
