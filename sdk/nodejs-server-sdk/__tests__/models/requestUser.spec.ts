import { DVCRequestUser } from '../../src/models/requestUser'

describe('DVCRequestUser Unit Tests', () => {
    it('should construct DVCRequestUser from UserParam', () => {
        const requestUser = new DVCRequestUser({
            user_id: 'user_id',
            email: 'email',
            name: 'name',
            language: 'en',
            country: 'ca',
            appVersion: 'appVersion',
            appBuild: 1,
            customData: { custom: 'data' },
            privateCustomData: { private: 'customData' }
        })
        expect(requestUser).toEqual(expect.objectContaining({
            user_id: 'user_id',
            email: 'email',
            name: 'name',
            language: 'en',
            country: 'ca',
            appVersion: 'appVersion',
            appBuild: 1,
            customData: { custom: 'data' },
            privateCustomData: { private: 'customData' },
            lastSeenDate: expect.any(Date),
            createdDate: expect.any(Date),
            platform: 'NodeJS',
            platformVersion: expect.any(String),
            sdkType: 'server',
            sdkVersion: expect.any(String)
        }))
    })

    it('should throw error if user_id is missing', () => {
        // @ts-ignore
        expect(() => new DVCRequestUser({})).toThrow('Must have a user_id set on the user')
        expect(() => new DVCRequestUser({ user_id: '' })).toThrow('Must have a user_id set on the user')
        // @ts-ignore
        expect(() => new DVCRequestUser({ user_id: 8 })).toThrow('user_id is not of type: string')
    })
})
