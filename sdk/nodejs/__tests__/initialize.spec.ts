import { DVCClient, DVCCloudClient, initialize } from '../src/index'

jest.mock('../src/bucketing')
jest.mock('../src/environmentConfigManager')

describe('NodeJS SDK Initialize', () => {
    afterAll(() => {
        jest.clearAllMocks()
    })

    it('sucessfully calls initialize with no options', async () => {
        const client: DVCClient = await initialize(
            'dvc_server_token',
        ).onClientInitialized()
        expect(client).toBeDefined()
    })

    it('fails to initialize in Local Bucketing mode when no token is provided', () => {
        expect(() => initialize(undefined as unknown as string)).toThrow(
            'Missing SDK key! Call initialize with a valid SDK key',
        )
    })

    it('fails to initialize in Local Bucketing mode when client token is provided', () => {
        expect(() => initialize('dvc_client_token')).toThrow(
            'Invalid SDK key provided. Please call initialize with a valid server SDK key',
        )
    })

    it('sucessfully calls initialize with enableCloudBucketing set to true', () => {
        const client: DVCCloudClient = initialize('dvc_server_token', {
            enableCloudBucketing: true,
        })
        expect(client).toBeDefined()
    })

    it('fails to initialize in Cloud Bucketing mode when no token is provided', () => {
        expect(() =>
            initialize(undefined as unknown as string, {
                enableCloudBucketing: true,
            }),
        ).toThrow('Missing SDK key! Call initialize with a valid SDK key')
    })
})
