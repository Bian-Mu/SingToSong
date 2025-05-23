import { useState } from 'react'
import './App.css'
import NotesViewer from './components/NotesViewer/NotesViewer'
import NoteAddBox from './components/NoteAddBox/NoteAddBox'
import { Divider } from 'antd'
import InstrumentViewer from './components/InstrumentViewer/InstrumentViewer'

declare global {
  interface Window {
    electronAPI: {
      readNotes: () => Promise<PitchUnion[]>;
      readConfig: () => Promise<Config>;
      processMidi: () => Promise<boolean>;
      writeNotes: (new_note: PitchUnion) => Promise<boolean>;
      deleteNotes: (delete_note: PitchUnion) => Promise<boolean>;
    };
  }
}

const App: React.FC = () => {

  const [refresh, setRefresh] = useState(0)
  // useEffect(() => {
  //   const unsub = window.electron.subscribeStatistics((stats) => console.log(stats))
  //   return unsub;
  // }, [])

  return (
    <div id='whole-page'>
      <div id='viewer-part'>
        <NotesViewer addRefresh={refresh} />
      </div>
      <div id='addbox-part'>
        <NoteAddBox onRefresh={() => { setRefresh(prev => prev + 1) }} />
        <Divider />
        <InstrumentViewer />
      </div>
    </div>
  )
}

export default App
