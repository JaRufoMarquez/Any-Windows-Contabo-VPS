import { useState } from 'react'
import ConnectionForm from './components/ConnectionForm'
import WorkflowProgress from './components/WorkflowProgress'
import './App.css'

function App() {
  const [jobId, setJobId] = useState(null)
  const [connectionInfo, setConnectionInfo] = useState(null)

  const handleConnectionSuccess = (job, connection) => {
    setJobId(job.job_id)
    setConnectionInfo(connection)
  }

  const handleReset = () => {
    setJobId(null)
    setConnectionInfo(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-16 h-16 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Windows Installer for Contabo VPS
          </h1>
          <p className="text-gray-600">
            Modern web-based installer - No SSH commands required
          </p>
        </header>

        <main>
          {!jobId ? (
            <ConnectionForm onSuccess={handleConnectionSuccess} />
          ) : (
            <WorkflowProgress jobId={jobId} connectionInfo={connectionInfo} onReset={handleReset} />
          )}
        </main>

        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>⚠️ This will erase all data on your VPS. Proceed at your own risk.</p>
          <p className="mt-2">
            Repository: <a href="https://github.com/JaRufoMarquez/Any-Windows-Contabo-VPS" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              JaRufoMarquez/Any-Windows-Contabo-VPS
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
