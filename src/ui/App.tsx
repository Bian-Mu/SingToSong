import { useEffect, useState } from 'react'
import './App.css'
import NotesViewer from './components/NotesViewer/NotesViewer'
import NoteAddBox from './components/NoteAddBox/NoteAddBox'
import { Divider } from 'antd'

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
        <Divider />
      </div>
    </div>
  )
}

export default App
