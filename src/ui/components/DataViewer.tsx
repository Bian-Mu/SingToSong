import React, { useState, useEffect } from 'react';
// import './DataViewer.css';

declare global {
    interface Window {
        electronAPI: {
            fetchData: () => Promise<{ success: boolean; data?: any; error?: string }>;
            processData: () => Promise<{ success: boolean; error?: string }>;
        };
    }
}

const DataViewer: React.FC = () => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await window.electronAPI.fetchData();
            if (result.success) {
                setData(result.data);
            } else {
                setError(result.error || 'Failed to fetch data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleProcessData = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await window.electronAPI.processData();
            if (result.success) {
                // 处理成功后刷新数据
                await fetchData();
            } else {
                setError(result.error || 'Failed to process data');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="data-container">
            <div className="data-display">
                <h2>Data from Python Backend</h2>
                {loading && <p>Loading...</p>}
                {error && <p className="error">Error: {error}</p>}
                {data && (
                    <pre>{JSON.stringify(data, null, 2)}</pre>
                )}
            </div>

            <div className="action-panel">
                <button
                    onClick={handleProcessData}
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Process Data'}
                </button>
                <button
                    onClick={fetchData}
                    disabled={loading}
                >
                    Refresh Data
                </button>
            </div>
        </div>
    );
};

export default DataViewer;