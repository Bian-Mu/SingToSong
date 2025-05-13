import { useEffect, useState } from 'react'
import './App.css'
import NotesViewer from './components/NotesViewer/NotesViewer'
import NoteAddBox from './components/NoteAddBox/NoteAddBox'

const App: React.FC = () => {

  // useEffect(() => {
  //   const unsub = window.electron.subscribeStatistics((stats) => console.log(stats))
  //   return unsub;
  // }, [])

  return (
    <div id='whole-page'>
      <div id='viewer-part'>
        <NotesViewer />
      </div>
      <div id='addbox-part'>
        <NoteAddBox />
      </div>
    </div>
  )
}

export default App
