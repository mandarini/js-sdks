import { DVCPopulatedUser } from '../src/User'

jest.mock('axios')
import axios, { AxiosInstance } from 'axios'
import { mocked } from 'jest-mock'

const axiosRequestMock = jest.fn()
const createMock = mocked(axios.create, true)

createMock.mockImplementation((): AxiosInstance => {
    return {
        request: axiosRequestMock,
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() },
        },
    } as unknown as AxiosInstance
})

import * as Request from '../src/Request'
import { BucketedUserConfig } from '@devcycle/types'
import { dvcDefaultLogger } from '../src/logger'

const defaultLogger = dvcDefaultLogger({ level: 'debug' })

describe('Request tests', () => {
    beforeEach(() => {
        axiosRequestMock.mockReset()
    })

    describe('baseRequestParams', () => {
        const { baseRequestHeaders } = Request
        it('should add sdkKey header if passed in', () => {
            const params = baseRequestHeaders('my_sdk_key')
            expect(params['Content-Type']).toBe('application/json')
            expect(params['Authorization']).toBe('my_sdk_key')
        })

        it('should not add header if no sdkKey passed in', () => {
            const params = baseRequestHeaders()
            expect(params['Content-Type']).toBe('application/json')
            expect(params['Authorization']).toBeUndefined()
        })
    })

    describe('getConfigJson', () => {
        it('should call get with serialized user and SDK key in params', async () => {
            const user = { user_id: 'my_user', isAnonymous: false }
            const sdkKey = 'my_sdk_key'
            axiosRequestMock.mockResolvedValue({ status: 200, data: {} })

            await Request.getConfigJson(
                sdkKey,
                user as DVCPopulatedUser,
                defaultLogger,
                {},
                {
                    sse: true,
                    lastModified: 1234,
                    etag: 'etag',
                },
            )

            expect(axiosRequestMock).toBeCalledWith({
                headers: { 'Content-Type': 'application/json' },
                method: 'GET',
                url:
                    'https://sdk-api.devcycle.com/v1/sdkConfig?sdkKey=' +
                    `${sdkKey}&user_id=${user.user_id}&isAnonymous=false&sse=1&sseLastModified=1234&sseEtag=etag`,
            })
        })

        it('should call local proxy for apiProxyURL option', async () => {
            const user = { user_id: 'my_user', isAnonymous: false }
            const sdkKey = 'my_sdk_key'
            const dvcOptions = { apiProxyURL: 'http://localhost:4000' }
            axiosRequestMock.mockResolvedValue({ status: 200, data: {} })

            await Request.getConfigJson(
                sdkKey,
                user as DVCPopulatedUser,
                defaultLogger,
                dvcOptions,
            )

            expect(axiosRequestMock).toBeCalledWith({
                headers: { 'Content-Type': 'application/json' },
                method: 'GET',
                url:
                    `${dvcOptions.apiProxyURL}/v1/sdkConfig?sdkKey=` +
                    `${sdkKey}&user_id=${user.user_id}&isAnonymous=false`,
            })
        })
    })

    describe('publishEvents', () => {
        it('should call get with serialized user and SDK key in params', async () => {
            const user = { user_id: 'my_user' } as DVCPopulatedUser
            const config = {} as BucketedUserConfig
            const sdkKey = 'my_sdk_key'
            const events = [{ type: 'event_1_type' }, { type: 'event_2_type' }]
            axiosRequestMock.mockResolvedValue({
                status: 200,
                data: 'messages',
            })

            await Request.publishEvents(
                sdkKey,
                config,
                user,
                events,
                defaultLogger,
            )

            expect(axiosRequestMock).toBeCalledWith({
                headers: {
                    Authorization: 'my_sdk_key',
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                url: 'https://events.devcycle.com/v1/events',
                data: {
                    events: [
                        expect.objectContaining({
                            customType: 'event_1_type',
                            type: 'customEvent',
                            user_id: 'my_user',
                            clientDate: expect.any(Number),
                        }),
                        expect.objectContaining({
                            customType: 'event_2_type',
                            type: 'customEvent',
                            user_id: 'my_user',
                            clientDate: expect.any(Number),
                        }),
                    ],
                    user,
                },
            })
        })
    })

    describe('saveEntity', () => {
        it('should send user data to edgedb api with url-encoded id', async () => {
            const user = { user_id: 'user@example.com', isAnonymous: false }
            const sdkKey = 'my_sdk_key'
            axiosRequestMock.mockResolvedValue({ status: 200, data: {} })

            await Request.saveEntity(
                user as DVCPopulatedUser,
                sdkKey,
                defaultLogger,
            )

            expect(axiosRequestMock).toBeCalledWith({
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'my_sdk_key',
                },
                data: {
                    user_id: 'user@example.com',
                    isAnonymous: false,
                },
                method: 'PATCH',
                url: 'https://sdk-api.devcycle.com/v1/edgedb/user%40example.com',
            })
        })
    })
})
