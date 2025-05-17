import React, { useState, useEffect } from 'react';
import './NotesViewer.css';
import SingleNote from './SingleNote/SingleNote';
import ConfigButton from '../ConfigButton/ConfigButton';
import { Divider, Select } from 'antd';
import { groupUnionsIntoMeters } from '../../utility/groupNotes';

declare global {
    interface Window {
        electronAPI: {
            readNotes: () => Promise<PitchUnion[]>;
            readConfig: () => Promise<Config>;
            processMidi: () => Promise<boolean>;
            writeNotes: (new_note: PitchUnion) => Promise<boolean>
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

interface NotesViewerProps {
    refresh: number
}


const NotesViewer: React.FC<NotesViewerProps> = ({ refresh }) => {
    const [data, setData] = useState<PitchUnion[][][]>([]);
    const [config, setConfig] = useState<Config>(defaultConfig)
    const [error, setError] = useState<string | null>(null);
    const [track, setTrack] = useState<number>(0)

    const readNotes = async () => {
        setError(null);
        try {
            const resultConfig = await window.electronAPI.readConfig();
            setConfig(resultConfig)

            const result = await window.electronAPI.readNotes();
            const filterData = result.filter((pitchunion) => pitchunion.track === track)
            const groupData = groupUnionsIntoMeters(filterData, resultConfig.timeSignature[0])
            const finalData: PitchUnion[][] = []
            groupData.groupNumbers.forEach((groupNum, index) => {
                if (!finalData[groupNum]) {
                    finalData[groupNum] = [];
                }
                finalData[groupNum].push(groupData.groupedUnions[index])
            })
            const bigGroups: PitchUnion[][][] = [];
            for (let i = 0; i < finalData.length; i += 4) {
                bigGroups.push(finalData.slice(i, i + 4))
            }
            setData(bigGroups)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };


    useEffect(() => {
        readNotes();
    }, [track, refresh]);




    return (
        <div id="music-sheet">
            <div id='sheet-head'>
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
            <div id="sheet-body">
                {error && <p className="error">Error: {error}</p>}
                {data.map((bigGroup, bigGroupIndex) => (
                    <div key={`big-group-${bigGroupIndex}`} className="big-group">
                        <span style={{ fontSize: "12px", width: "20px" }}>
                            {16 * (bigGroupIndex)}
                        </span>

                        {`|`}
                        {bigGroup.map((smallGroup, smallGroupIndex) => (
                            <React.Fragment key={`small-group-wrapper-${bigGroupIndex}-${smallGroupIndex}`}>
                                <div key={`small-group-${bigGroupIndex}-${smallGroupIndex}`} className="small-group">
                                    <>
                                        &nbsp;
                                        {smallGroup.map((element, elementIndex) => (
                                            <SingleNote
                                                key={`note-${bigGroupIndex}-${smallGroupIndex}-${elementIndex}`}
                                                pitchunion={element}
                                                config={config}
                                            />
                                        ))}
                                    </>

                                </div>
                                &nbsp;{"|"}
                            </React.Fragment>
                        ))}
                    </div>
                ))}
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