type Statistics = {
    cpuUsage: number,
    ramUsage: number,
    storageUsage: number
}

type StaticData = {
    totalStorage: number,
    cpuModel: string,
    totalMemoryGB: number
}

type PitchUnion = {
    track: number
    cut: number
    sustain: boolean
    start_beat: number
    duration: number
    note: string
    instrument: number
}

type Config = {
    name: string,
    tempo: number,
    timeSignature: [number, number]
    keySignature: string
}


type EventPayloadMapping = {
    statistics: Statistics,
    getStaticData: StaticData
    readNotes: PitchUnion[]
    readConfig: Config
    processMidi: boolean
}

type UnSubscribeFunction = () => void

interface Window {
    electron: {
        subscribeStatistics: (callback: (statistics: Statistics) => void) => UnSubscribeFunction;
        getStaticData: () => Promise<StaticData>
    }
}