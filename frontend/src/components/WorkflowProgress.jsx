import { useState, useEffect } from 'react'
import axios from 'axios'
import PromptDialog from './PromptDialog'

const WorkflowProgress = ({ jobId, connectionInfo, onReset }) => {
  const [status, setStatus] = useState(null)
  const [error, setError] = useState('')
  const [polling, setPolling] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`/api/jobs/${jobId}`)
        setStatus(response.data)

        // Check if workflow is complete or failed
        if (response.data.current_step) {
          const currentStepStatus = response.data.current_step.status
          if (currentStepStatus === 'failed') {
            setPolling(false)
          }
          // Check if all steps are completed
          if (response.data.completed_steps === response.data.total_steps) {
            setPolling(false)
          }
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch status')
        setPolling(false)
      }
    }

    fetchStatus()
    
    if (polling) {
      const interval = setInterval(fetchStatus, 2000) // Poll every 2 seconds
      return () => clearInterval(interval)
    }
  }, [jobId, polling])

  const handleInputSubmit = async (value) => {
    try {
      await axios.post(`/api/jobs/${jobId}/input`, { value })
      setPolling(true) // Resume polling after input
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit input')
    }
  }

  const getStepIcon = (stepStatus) => {
    if (stepStatus === 'completed') {
      return (
        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    } else if (stepStatus === 'running' || stepStatus === 'waiting_input') {
      return (
        <svg className="w-6 h-6 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )
    } else if (stepStatus === 'failed') {
      return (
        <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    } else {
      return (
        <svg className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" />
        </svg>
      )
    }
  }

  if (!status) {
    return (
      <div className="flex justify-center items-center py-20">
        <svg className="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    )
  }

  const progressPercentage = (status.completed_steps / status.total_steps) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Installation Progress</h2>
            <p className="text-gray-600">Connected to: {connectionInfo.host}</p>
          </div>
          <button
            onClick={onReset}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{status.completed_steps} / {status.total_steps} steps completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Current step */}
        {status.current_step && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              {getStepIcon(status.current_step.status)}
              <div className="ml-3">
                <p className="font-medium text-gray-800">{status.current_step.name}</p>
                <p className="text-sm text-gray-600">{status.current_step.description}</p>
              </div>
            </div>
            {status.current_step.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                Error: {status.current_step.error}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>

      {/* Steps list */}
      <div className="bg-white rounded-lg shadow-xl p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Installation Steps</h3>
        <div className="space-y-3">
          {status.steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center p-3 rounded-lg border ${
                step.status === 'running' || step.status === 'waiting_input'
                  ? 'border-blue-300 bg-blue-50'
                  : step.status === 'completed'
                  ? 'border-green-200 bg-green-50'
                  : step.status === 'failed'
                  ? 'border-red-200 bg-red-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex-shrink-0">
                {getStepIcon(step.status)}
              </div>
              <div className="ml-3 flex-grow">
                <p className="font-medium text-gray-800">{step.name}</p>
                {step.error && (
                  <p className="text-sm text-red-600 mt-1">Error: {step.error}</p>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Step {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Dialog */}
      {status.waiting_for_input && status.current_step?.prompt && (
        <PromptDialog
          prompt={status.current_step.prompt}
          onSubmit={handleInputSubmit}
        />
      )}

      {/* Completion message */}
      {status.completed_steps === status.total_steps && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="ml-4">
              <h3 className="text-xl font-bold text-green-800">Installation Complete!</h3>
              <p className="text-green-700 mt-1">
                Your VPS has been prepared for Windows installation. Connect via VNC to complete the Windows setup.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WorkflowProgress
