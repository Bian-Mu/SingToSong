import React, { useState, useEffect } from 'react';
import './NotesViewer.css';
import SingleNote from './SingleNote/SingleNote';
import ConfigButton from '../ConfigButton/ConfigButton';
import { Divider, Select } from 'antd';

declare global {
    interface Window {
        electronAPI: {
            readNotes: () => Promise<PitchUnion[]>;
            readConfig: () => Promise<Config>
        };
    }
}


const defaultConfig: Config = {
    name: "default",
    tempo: 60,
    timeSignature: [
        4,
        4
    ],
    keySignature: "C"
}

const NotesViewer: React.FC = () => {
    const [data, setData] = useState<PitchUnion[]>([]);
    const [config, setConfig] = useState<Config>(defaultConfig)
    const [error, setError] = useState<string | null>(null);
    const [track, setTrack] = useState<number>(0)

    const readNotes = async () => {
        setError(null);
        try {
            const result = await window.electronAPI.readNotes();

            const filterData = result.filter((pitchunion) => pitchunion.track === track)
            setData(filterData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };

    const readConfig = async () => {
        setError(null);
        try {
            const result = await window.electronAPI.readConfig();
            setConfig(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };

    useEffect(() => {
        readNotes();
        readConfig()
    }, [track]);

    return (
        <div className="data-container">
            <div>
                {config === defaultConfig ? "请设置config" : <ConfigButton config={config} />}
                <div style={{ height: "48px", lineHeight: "48px" }}>
                    <span style={{ fontSize: "18px" }}>预览音轨：</span>
                    <Select defaultValue={track} id='track-select' onChange={(value) => setTrack(value)}>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15].map((value) => (
                            <Select.Option key={value} value={value}>
                                {value}
                            </Select.Option>
                        ))}
                    </Select>
                </div>

            </div>
            <Divider />
            <div className="data-display">
                {error && <p className="error">Error: {error}</p>}
                {data && data.map(element => {
                    return <SingleNote pitchunion={element} config={config} />
                })
                }
            </div>
            {/* 
            <div className="action-panel">
                <button
                    onClick={readNotes}
                >
                    刷新
                </button>
            </div> */}
        </div>
    );
};

export default NotesViewer;