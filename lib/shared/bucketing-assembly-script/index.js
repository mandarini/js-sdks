const ProtobufTypes = require('./protobuf/compiled')

const instantiate = async (debug = false, imports = {}) => {
    const releaseStr = debug ? 'debug' : 'release'
    const { instantiate } = require(`./build/bucketing-lib.${releaseStr}`)
    const url = new URL(`file://${__dirname}/build/bucketing-lib.${releaseStr}.wasm`)

    // asynchronously compile the webassembly source
    const compiled = await (async () => {
        try {
            const source = await globalThis.fetch(url)
            return await globalThis.WebAssembly.compileStreaming(source)
        } catch {
            let fs
            try {
                fs = require('node:fs/promises')
            } catch {
                fs = require('fs/promises')
            }
            return globalThis.WebAssembly.compile(await fs.readFile(url))
        }
    })()

    // call the instantiate function with the compiled source to execute the WASM and set up the bindings to native code
    if (debug) {
        const { instantiate: instantiateDebug } = require('./build/bucketing-lib.debug')
        return await instantiateDebug(compiled, imports)
    } else {
        return await instantiate(compiled, imports)
    }
}

module.exports = {
    instantiate,
    ProtobufTypes,
}
