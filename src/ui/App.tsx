import { useEffect, useState } from 'react'
import './App.css'
import NotesViewer from './components/NotesViewer/NotesViewer'

const App: React.FC = () => {
  const [count, setCount] = useState(0)


  useEffect(() => {
    const unsub = window.electron.subscribeStatistics((stats) => console.log(stats))
    return unsub;
  }, [])

  return (
    <div>
      <NotesViewer />

    </div>
  )
}

export default App
