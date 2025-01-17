import { DVCClient } from './Client'
jest.mock('../src/Request')
jest.mock('../src/StreamingConnection')

type Variables = {
    enum_var: 'value1' | 'value2'
    bool: boolean
    string: string
    number: number
}

describe('Client', () => {
    it('should prevent invalid variables', () => {
        const client = new DVCClient<Variables>('test', { user_id: 'test' })

        // @ts-expect-error - should not allow invalid variables
        client.variable('something', false)
        client.variable('enum_var', 'value1')
        client.variable('enum_var', 'value2')
        // @ts-expect-error - should not allow invalid variable values for enums
        const enumVar = client.variable('enum_var', 'something_else')

        // @ts-expect-error - should not allow comparison with impossible values
        if (enumVar.value === 'something else') {
            // no-op
        }
        if (enumVar.value === 'value1') {
            // no-op
        }
        client.variable('bool', true)
        client.variable('string', 'test')
        client.variable('number', 1)
    })
})
