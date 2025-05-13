import React, { useState, useEffect } from 'react';
// import './DataViewer.css';

declare global {
    interface Window {
        electronAPI: {
            readNotes: () => Promise<PitchUnion[]>;
            processData: () => Promise<{ success: boolean; error?: string }>;
        };
    }
}

const DataViewer: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const readNotes = async () => {
        setError(null);
        try {
            const result = await window.electronAPI.readNotes();
            console.log(result[1])
            setData(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    };



    useEffect(() => {
        readNotes();
    }, []);

    return (
        <div className="data-container">
            <div className="data-display">
                <h2>Data from Python Backend</h2>
                {error && <p className="error">Error: {error}</p>}
                {data && (
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                )}
            </div>

            <div className="action-panel">
                <button
                    onClick={readNotes}
                >
                    Refresh Data
                </button>
            </div>
        </div>
    );
};

export default DataViewer;