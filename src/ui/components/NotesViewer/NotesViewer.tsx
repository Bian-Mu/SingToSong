import React, { useState, useEffect } from 'react';
import './NotesViewer.css';
import SingleNote from './SingleNote/SingleNote';
import ConfigButton from '../ConfigButton/ConfigButton';
import { Divider } from 'antd';

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

    const readNotes = async () => {
        setError(null);
        try {
            const result = await window.electronAPI.readNotes();
            setData(result)
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
    }, []);

    return (
        <div id="music-sheet">
            <div id='sheet-head'>
                {config === defaultConfig ? "请设置config" : <ConfigButton config={config} />}
            </div>
            <Divider />
            <div className="sheet-body">
                {error && <p className="error">Error: {error}</p>}
                {(data && config) && data.map(element => {
                    return <SingleNote pitchunion={element} config={config} />
                })
                }
            </div>

            {/* <div className="action-panel">
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