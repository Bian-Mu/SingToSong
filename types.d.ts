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

type EventPayloadMapping = {
    statistics: Statistics,
    getStaticData: StaticData
}

type UnSubscribeFunction = () => void

interface Window {
    electron: {
        subscribeStatistics: (callback: (statistics: Statistics) => void) => UnSubscribeFunction;
        getStaticData: () => Promise<StaticData>
    }
}