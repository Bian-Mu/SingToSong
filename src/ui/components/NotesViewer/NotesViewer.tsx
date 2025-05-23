import React, { useState, useEffect } from 'react';
import './NotesViewer.css';
import SingleNote from './SingleNote/SingleNote';
import ConfigButton from '../ConfigButton/ConfigButton';
import { Divider, message, Select } from 'antd';
import { groupUnionsIntoMeters } from '../../utility/groupNotes';
import _ from 'lodash';

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
    addRefresh: number
}


const NotesViewer: React.FC<NotesViewerProps> = ({ addRefresh }) => {
    const [data, setData] = useState<PitchUnion[][][]>([]);
    const [config, setConfig] = useState<Config>(defaultConfig)
    const [error, setError] = useState<string | null>(null);
    const [track, setTrack] = useState<number>(0)
    const [messageApi, contextHolder] = message.useMessage();
    const [deleteRefresh, setDeleteRefresh] = useState<number>(0)

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
            const cut = 2
            for (let i = 0; i < finalData.length; i += cut) {
                bigGroups.push(finalData.slice(i, i + cut))
            }
            // console.log(bigGroups[0][1])
            setData(bigGroups)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };

    const handleRightClick = async (pitchunion: PitchUnion) => {
        try {
            const result = await window.electronAPI.deleteNotes(pitchunion)
            if (result) {
                messageApi.success("删除成功")
                setDeleteRefresh(prev => prev + 1)
            } else {
                messageApi.success("出错了")
            }
        } catch (error: any) {
            messageApi.error(error)
        }
    };

    useEffect(() => {
        readNotes();
    }, [track, addRefresh, deleteRefresh]);


    // console.log("config", config, "other", defaultConfig)

    return (
        <div id="music-sheet">
            {contextHolder}
            <div id='sheet-head'>
                {_.isEqual(config, defaultConfig) ? "请设置config" : <ConfigButton config={config} />}
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
                            {4 * (bigGroupIndex)}
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
                                                onRightClick={handleRightClick}
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