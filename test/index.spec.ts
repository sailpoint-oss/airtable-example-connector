import { connector } from '../src/index'
import { StandardCommand } from '@sailpoint/connector-sdk'
import { PassThrough } from 'stream'

jest.mock('../src/airtable')

const mockConfig: any = {
    apiKey: 'xxx',
    airtableBase: 'xxx',
}
process.env.CONNECTOR_CONFIG = Buffer.from(JSON.stringify(mockConfig)).toString('base64')

describe('connector unit tests', () => {

    it('connector SDK major version should be 0', async () => {
        const version = (await connector()).sdkVersion;
        expect(version).toStrictEqual(0);
    })

    it('should execute stdTestConnectionHandler', async () => {
        await (await connector())._exec(
            StandardCommand.StdTestConnection,
            {},
            undefined,
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(chunk).toStrictEqual({}))
        )
    })

    it('should execute stdAccountCreate', async () => {
        await (await connector())._exec(
            StandardCommand.StdAccountCreate,
            {},
            {"attributes": {"id": "test", "password": "1234"}},
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(chunk.key.simple.id).toStrictEqual("1234"))
        )
    })

    it('should execute stdAccountList', async () => {
        await (await connector())._exec(
            StandardCommand.StdAccountList,
            {},
            {"attributes": {"id": "test"}},
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(chunk.key.simple.id).toStrictEqual("1234"))
        )
    })

    it('should execute stdAccountRead', async () => {
        await (await connector())._exec(
            StandardCommand.StdAccountRead,
            {},
            { "key": {"simple": { "id": "1234"}}, "attributes": {"id": "test"}},
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(chunk.key.simple.id).toStrictEqual("1234"))
        )
    })

    it('should execute stdAccountDelete', async () => {
        await (await connector())._exec(
            StandardCommand.StdAccountDelete,
            {},
            { "key": {"simple": { "id": "1234"}}, "attributes": {"id": "test"}},
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(chunk).toStrictEqual({}))
        )
    })

    it('should execute stdEntitlementList', async () => {
        await (await connector())._exec(
            StandardCommand.StdEntitlementList,
            {},
            {"attributes": {"id": "test"}},
            new PassThrough({ objectMode: true }).on('data', (chunk) => 
            expect(chunk.key.simple.id).toStrictEqual("4321"))
        )
    })

    it('should execute stdEntitlementRead', async () => {
        await (await connector())._exec(
            StandardCommand.StdEntitlementRead,
            {},
            {"attributes": {"id": "test"}},
            new PassThrough({ objectMode: true }).on('data', (chunk) => 
            expect(chunk.key.simple.id).toStrictEqual("4321"))
        )
    })

    it('should execute stdAccountDiscoverSchema', async () => {
        await (await connector())._exec(
            StandardCommand.StdAccountDiscoverSchema,
            {},
            {},
            new PassThrough({ objectMode: true }).on('data', (chunk) => 
            expect(chunk.identityAttribute).toStrictEqual("email"))
        )
    })

    it('should execute stdAccountDisable', async () => {
        await (await connector())._exec(
            StandardCommand.StdAccountDisable,
            {},
            { "key": {"simple": { "id": "1234"}}, "attributes": {"id": "test"}},
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(chunk.key.simple.id).toStrictEqual("1234"))
        )
    })

    it('should execute stdAccountEnable', async () => {
        await (await connector())._exec(
            StandardCommand.StdAccountEnable,
            {},
            { "key": {"simple": { "id": "1234"}}, "attributes": {"id": "test"}},
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(chunk.key.simple.id).toStrictEqual("1234"))
        )
    })

    it('should execute stdAccountUnlock', async () => {
        await (await connector())._exec(
            StandardCommand.StdAccountUnlock,
            {},
            { "key": {"simple": { "id": "1234"}}, "attributes": {"id": "test"}},
            new PassThrough({ objectMode: true }).on('data', (chunk) => expect(chunk.key.simple.id).toStrictEqual("1234"))
        )
    })
})