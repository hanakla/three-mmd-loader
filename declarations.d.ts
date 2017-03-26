declare module 'mmd-parser' {
    export class CharsetEncoder {
        /**
         * Converts from Shift_JIS Uint8Array data to Unicode strings.
         */
        s2u(Uint8Array: Uint8Array): string

        s2uTable: {[code: string]: number}
    }

    export interface Pmd {}
    export interface Vmd {}
    export interface Vpd {}

    export interface Pmx {
        metadata: {
            format: 'pmx'
            coordinateSystem: 'left'
            magic: string
            version: number
            headerSize: number
            encoding: number
            additionalUvNum: number
            vertexIndexSize: number
            textureIndexSize: number
            materialIndexSize: number
            boneIndexSize: number
            morphIndexSize: number
            rigidBodyIndexSize: number
            modelName: string
            englishModelName: string
            comment: string
            englishComment: string
        }
        vertices: PmxVertex[]
    }

    export interface PmxVertex {
        position: [number, number, number]
        normal: [number, number, number]
        uv: [number, number]
        auvs: [number, number, number, number][]
        /**
         * 0: BDEF1
         * 1: BDEF2
         * 2: BDEF4
         * (3: SDEF)
         */
        type: 0|1|2
        skinIndices: number[]
        skinWeights: number[]
    }


    export class Parser {
        parsePmd(buffer: ArrayBuffer, leftToRight: boolean): Pmd
        parsePmx(buffer: ArrayBuffer, leftToRight: boolean): Pmx
        parseVmd(buffer: ArrayBuffer, leftToRight: boolean): Vmd
        parseVpd(text: string, leftToRight: boolean): Vpd
        mergeVmds(vmds: Vmd[]): Vmd
    }
}