import { useState } from 'react'

const PromptDialog = ({ prompt, onSubmit }) => {
  const [inputValue, setInputValue] = useState(prompt.default || '')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (value) => {
    setSubmitting(true)
    await onSubmit(value)
    setSubmitting(false)
  }

  const renderPromptContent = () => {
    switch (prompt.type) {
      case 'confirm':
        return (
          <div>
            <p className="text-gray-700 mb-6">{prompt.message}</p>
            <div className="flex space-x-3">
              {prompt.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleSubmit(option)}
                  disabled={submitting}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                    option === 'confirm' || option === 'reboot'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {option === 'confirm' ? '✓ Confirm' : option === 'reboot' ? '🔄 Reboot Now' : '✗ Cancel'}
                </button>
              ))}
            </div>
          </div>
        )

      case 'choice':
        return (
          <div>
            <p className="text-gray-700 mb-4">{prompt.message}</p>
            <div className="space-y-3">
              {prompt.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleSubmit(option.value)}
                  disabled={submitting}
                  className="w-full p-4 text-left border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )

      case 'text':
        return (
          <div>
            <p className="text-gray-700 mb-4">{prompt.message}</p>
            <input
              type="text"
              placeholder={prompt.placeholder || ''}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            {prompt.default && (
              <p className="text-sm text-gray-500 mb-4">
                Default: {prompt.default}
              </p>
            )}
            <button
              onClick={() => handleSubmit(inputValue || prompt.default)}
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Continue'}
            </button>
          </div>
        )

      case 'select':
        return (
          <div>
            <p className="text-gray-700 mb-4">{prompt.message}</p>
            
            {/* Show WIM info if available */}
            {prompt.wim_info && (
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">{prompt.wim_info}</pre>
              </div>
            )}
            
            <div className="space-y-2 mb-4">
              {prompt.options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center p-3 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="wim-image"
                    value={option.value}
                    checked={inputValue === option.value}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-3 text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            <button
              onClick={() => handleSubmit(inputValue)}
              disabled={submitting || !inputValue}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Continue with Selected Image'}
            </button>
          </div>
        )

      case 'info':
        return (
          <div>
            <p className="text-gray-700 mb-6">{prompt.message}</p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> You can use SCP, SFTP, or WinSCP to upload the ISO file to your VPS.
              </p>
              <p className="text-sm text-blue-800 mt-2">
                Example SCP command:
                <code className="block mt-1 p-2 bg-white rounded text-xs">
                  scp /path/to/file.iso root@{'{your-vps-ip}'}:/root/windisk/
                </code>
              </p>
            </div>
            <button
              onClick={() => handleSubmit('continue')}
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Continuing...' : '✓ I have uploaded the file, Continue'}
            </button>
          </div>
        )

      default:
        return <p className="text-gray-700">Unknown prompt type</p>
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center mb-4">
            {prompt.title.includes('⚠️') || prompt.title.includes('WARNING') ? (
              <svg className="w-8 h-8 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-blue-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
            <h3 className="text-xl font-bold text-gray-800">
              {prompt.title.replace('⚠️', '').trim()}
            </h3>
          </div>
          {renderPromptContent()}
        </div>
      </div>
    </div>
  )
}

export default PromptDialog
