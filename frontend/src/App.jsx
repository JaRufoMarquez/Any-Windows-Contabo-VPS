import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Configuration constants
const DEFAULT_WINDOWS_ISO_URL = 'https://bit.ly/3UGzNcB';
const DEFAULT_VIRTIO_ISO_URL = 'https://bit.ly/4d1g7Ht';
const POLL_INTERVAL_MS = 2000;

const translations = {
  en: {
    title: 'Windows VPS Installer',
    subtitle: 'Automated Windows Installation for Contabo VPS',
    language: 'Language',
    vpsCredentials: 'VPS Credentials',
    host: 'Host IP',
    username: 'Username',
    password: 'Password (Rescue System)',
    port: 'SSH Port',
    startInstallation: 'Start Installation',
    cancel: 'Cancel',
    continue: 'Continue',
    yes: 'Yes',
    no: 'No',
    confirm: 'Confirm',
    skip: 'Skip',
    download: 'Download',
    upload: 'Upload',
    status: 'Status',
    currentStep: 'Current Step',
    pending: 'Pending',
    running: 'Running',
    completed: 'Completed',
    failed: 'Failed',
    waitingInput: 'Waiting for Input',
    connectionForm: {
      title: 'Connect to Your VPS',
      description: 'Enter your Contabo VPS details to begin the installation process.',
      hostPlaceholder: 'e.g., 192.168.1.100',
      passwordPlaceholder: 'Rescue system password',
    },
    partitionWarning: {
      title: '⚠️ Warning: Destructive Operation',
      message: 'This will completely erase all data on /dev/sda and create new partitions. This action cannot be undone.',
      confirm: 'I understand and want to proceed',
    },
    isoDownload: {
      windowsTitle: 'Windows ISO Configuration',
      windowsQuestion: 'Do you want to download Windows.iso automatically?',
      virtioTitle: 'Virtio Drivers ISO Configuration',
      virtioQuestion: 'Do you want to download Virtio.iso automatically?',
      urlPrompt: 'Enter URL (or use default)',
      defaultUrl: 'Use default URL',
      uploadInstructions: 'Please upload the file to /root/windisk on the VPS and click Continue when ready.',
    },
    bootImage: {
      title: 'Select Boot Image',
      prompt: 'Select the boot image index from the list below:',
      indexLabel: 'Image Index',
    },
    reboot: {
      title: 'Installation Complete',
      question: 'Do you want to reboot the system now?',
      note: 'The SSH connection will be lost after reboot.',
    },
    errors: {
      connectionFailed: 'Failed to connect to VPS',
      installationFailed: 'Installation failed',
      invalidInput: 'Invalid input',
    },
    footer: {
      security: 'Security: Passwords are not stored and kept in memory only.',
      opensource: 'Open Source Project',
    }
  },
  es: {
    title: 'Instalador de Windows VPS',
    subtitle: 'Instalación Automatizada de Windows para Contabo VPS',
    language: 'Idioma',
    vpsCredentials: 'Credenciales del VPS',
    host: 'IP del Host',
    username: 'Usuario',
    password: 'Contraseña (Sistema de Rescate)',
    port: 'Puerto SSH',
    startInstallation: 'Iniciar Instalación',
    cancel: 'Cancelar',
    continue: 'Continuar',
    yes: 'Sí',
    no: 'No',
    confirm: 'Confirmar',
    skip: 'Omitir',
    download: 'Descargar',
    upload: 'Subir',
    status: 'Estado',
    currentStep: 'Paso Actual',
    pending: 'Pendiente',
    running: 'En Ejecución',
    completed: 'Completado',
    failed: 'Fallido',
    waitingInput: 'Esperando Entrada',
    connectionForm: {
      title: 'Conectar a su VPS',
      description: 'Ingrese los detalles de su VPS Contabo para comenzar el proceso de instalación.',
      hostPlaceholder: 'ej., 192.168.1.100',
      passwordPlaceholder: 'Contraseña del sistema de rescate',
    },
    partitionWarning: {
      title: '⚠️ Advertencia: Operación Destructiva',
      message: 'Esto borrará completamente todos los datos en /dev/sda y creará nuevas particiones. Esta acción no se puede deshacer.',
      confirm: 'Entiendo y quiero continuar',
    },
    isoDownload: {
      windowsTitle: 'Configuración de ISO de Windows',
      windowsQuestion: '¿Desea descargar Windows.iso automáticamente?',
      virtioTitle: 'Configuración de ISO de Drivers Virtio',
      virtioQuestion: '¿Desea descargar Virtio.iso automáticamente?',
      urlPrompt: 'Ingrese URL (o use la predeterminada)',
      defaultUrl: 'Usar URL predeterminada',
      uploadInstructions: 'Por favor, suba el archivo a /root/windisk en el VPS y haga clic en Continuar cuando esté listo.',
    },
    bootImage: {
      title: 'Seleccionar Imagen de Arranque',
      prompt: 'Seleccione el índice de imagen de arranque de la lista a continuación:',
      indexLabel: 'Índice de Imagen',
    },
    reboot: {
      title: 'Instalación Completa',
      question: '¿Desea reiniciar el sistema ahora?',
      note: 'La conexión SSH se perderá después del reinicio.',
    },
    errors: {
      connectionFailed: 'Error al conectar al VPS',
      installationFailed: 'La instalación falló',
      invalidInput: 'Entrada inválida',
    },
    footer: {
      security: 'Seguridad: Las contraseñas no se almacenan y se mantienen solo en memoria.',
      opensource: 'Proyecto de Código Abierto',
    }
  }
};

function App() {
  const [lang, setLang] = useState('en');
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [credentials, setCredentials] = useState({
    host: '',
    username: 'root',
    password: '',
    port: 22
  });
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState(null);

  const t = translations[lang];

  useEffect(() => {
    if (jobId) {
      const interval = setInterval(async () => {
        try {
          const response = await axios.get(`/api/jobs/${jobId}`);
          setJobStatus(response.data);
          
          // Stop polling if job is in terminal state
          if (response.data.status === 'completed' || response.data.status === 'failed') {
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Error fetching job status:', err);
        }
      }, POLL_INTERVAL_MS);
      return () => clearInterval(interval);
    }
  }, [jobId]);

  const handleStartInstallation = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post('/api/jobs', credentials);
      setJobId(response.data.id);
      setJobStatus(response.data);
    } catch (err) {
      setError(t.errors.connectionFailed + ': ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleSubmitInput = async (inputKey, value) => {
    try {
      await axios.post(`/api/jobs/${jobId}/input`, { response: value });
      setUserInput('');
    } catch (err) {
      setError(t.errors.invalidInput + ': ' + (err.response?.data?.detail || err.message));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gray-200 text-gray-800';
      case 'running': return 'bg-blue-500 text-white animate-pulse';
      case 'completed': return 'bg-green-500 text-white';
      case 'failed': return 'bg-red-500 text-white';
      case 'waiting_input': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '⚙️';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'waiting_input': return '⏸️';
      default: return '○';
    }
  };

  const renderUserInputPrompt = () => {
    if (!jobStatus || jobStatus.status !== 'waiting_input') return null;

    const currentStep = jobStatus.steps[jobStatus.current_step];
    const waitingFor = currentStep?.output?.includes('partition') ? 'partition_confirm' :
                       currentStep?.output?.includes('Windows.iso download') ? 'windows_iso_download' :
                       currentStep?.output?.includes('Windows.iso URL') ? 'windows_iso_url' :
                       currentStep?.output?.includes('upload Windows.iso') ? 'windows_iso_upload' :
                       currentStep?.output?.includes('Virtio.iso download') ? 'virtio_iso_download' :
                       currentStep?.output?.includes('Virtio.iso URL') ? 'virtio_iso_url' :
                       currentStep?.output?.includes('upload Virtio.iso') ? 'virtio_iso_upload' :
                       currentStep?.output?.includes('boot image') ? 'boot_image_index' :
                       currentStep?.output?.includes('reboot') ? 'reboot_confirm' : null;

    if (waitingFor === 'partition_confirm') {
      return (
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mt-4">
          <h3 className="text-xl font-bold text-red-800 mb-2">{t.partitionWarning.title}</h3>
          <p className="text-gray-700 mb-4">{t.partitionWarning.message}</p>
          <div className="flex gap-4">
            <button
              onClick={() => handleSubmitInput('partition_confirm', true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              {t.partitionWarning.confirm}
            </button>
            <button
              onClick={() => handleSubmitInput('partition_confirm', false)}
              className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg"
            >
              {t.cancel}
            </button>
          </div>
        </div>
      );
    }

    if (waitingFor === 'windows_iso_download' || waitingFor === 'virtio_iso_download') {
      const isWindows = waitingFor === 'windows_iso_download';
      return (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mt-4">
          <h3 className="text-xl font-bold text-blue-800 mb-2">
            {isWindows ? t.isoDownload.windowsTitle : t.isoDownload.virtioTitle}
          </h3>
          <p className="text-gray-700 mb-4">
            {isWindows ? t.isoDownload.windowsQuestion : t.isoDownload.virtioQuestion}
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => handleSubmitInput(waitingFor, true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              {t.yes} - {t.download}
            </button>
            <button
              onClick={() => handleSubmitInput(waitingFor, false)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              {t.no} - {t.upload}
            </button>
          </div>
        </div>
      );
    }

    if (waitingFor === 'windows_iso_url' || waitingFor === 'virtio_iso_url') {
      const defaultUrl = waitingFor === 'windows_iso_url' ? DEFAULT_WINDOWS_ISO_URL : DEFAULT_VIRTIO_ISO_URL;
      return (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mt-4">
          <h3 className="text-xl font-bold text-blue-800 mb-2">{t.isoDownload.urlPrompt}</h3>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={defaultUrl}
            className="w-full p-3 border rounded-lg mb-4"
          />
          <div className="flex gap-4">
            <button
              onClick={() => handleSubmitInput(waitingFor, userInput || defaultUrl)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              {t.confirm}
            </button>
          </div>
        </div>
      );
    }

    if (waitingFor === 'windows_iso_upload' || waitingFor === 'virtio_iso_upload') {
      return (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mt-4">
          <h3 className="text-xl font-bold text-yellow-800 mb-2">📤 {t.upload}</h3>
          <p className="text-gray-700 mb-4">{t.isoDownload.uploadInstructions}</p>
          <button
            onClick={() => handleSubmitInput(waitingFor, true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            {t.continue}
          </button>
        </div>
      );
    }

    if (waitingFor === 'boot_image_index') {
      return (
        <div className="bg-purple-50 border-2 border-purple-300 rounded-lg p-6 mt-4">
          <h3 className="text-xl font-bold text-purple-800 mb-2">{t.bootImage.title}</h3>
          <p className="text-gray-700 mb-2">{t.bootImage.prompt}</p>
          <pre className="bg-gray-100 p-4 rounded mb-4 text-sm overflow-auto max-h-60">
            {currentStep?.output}
          </pre>
          <div className="flex gap-4 items-center">
            <label className="font-semibold">{t.bootImage.indexLabel}:</label>
            <input
              type="number"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="2"
              className="p-3 border rounded-lg w-24"
              min="1"
            />
            <button
              onClick={() => handleSubmitInput(waitingFor, userInput || '2')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              {t.confirm}
            </button>
          </div>
        </div>
      );
    }

    if (waitingFor === 'reboot_confirm') {
      return (
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6 mt-4">
          <h3 className="text-xl font-bold text-green-800 mb-2">🎉 {t.reboot.title}</h3>
          <p className="text-gray-700 mb-2">{t.reboot.question}</p>
          <p className="text-sm text-gray-600 mb-4">{t.reboot.note}</p>
          <div className="flex gap-4">
            <button
              onClick={() => handleSubmitInput(waitingFor, true)}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              {t.yes} - {t.reboot.title}
            </button>
            <button
              onClick={() => handleSubmitInput(waitingFor, false)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
            >
              {t.no} - {t.skip}
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span>🪟</span>
                {t.title}
              </h1>
              <p className="text-blue-100 mt-1">{t.subtitle}</p>
            </div>
            <div className="flex items-center gap-2">
              <label className="font-semibold">{t.language}:</label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-white text-gray-800 rounded-lg px-4 py-2 font-semibold"
              >
                <option value="en">🇬🇧 English</option>
                <option value="es">🇪🇸 Español</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {!jobId ? (
          /* Connection Form */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl p-8">
              <div className="text-center mb-6">
                <div className="text-6xl mb-4">🖥️</div>
                <h2 className="text-2xl font-bold text-gray-800">{t.connectionForm.title}</h2>
                <p className="text-gray-600 mt-2">{t.connectionForm.description}</p>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleStartInstallation} className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">{t.host}</label>
                  <input
                    type="text"
                    value={credentials.host}
                    onChange={(e) => setCredentials({ ...credentials, host: e.target.value })}
                    placeholder={t.connectionForm.hostPlaceholder}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">{t.username}</label>
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">{t.password}</label>
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    placeholder={t.connectionForm.passwordPlaceholder}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">{t.port}</label>
                  <input
                    type="number"
                    value={credentials.port}
                    onChange={(e) => setCredentials({ ...credentials, port: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all"
                >
                  🚀 {t.startInstallation}
                </button>
              </form>
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">ℹ️ {t.footer.security}</span>
              </p>
            </div>
          </div>
        ) : (
          /* Installation Progress */
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl p-8">
              {/* Status Header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">{t.status}</h2>
                  <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(jobStatus?.status)}`}>
                    {jobStatus?.status.toUpperCase()}
                  </span>
                </div>
                
                {jobStatus?.error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>{t.errors.installationFailed}:</strong> {jobStatus.error}
                  </div>
                )}
              </div>

              {/* Progress Steps */}
              <div className="space-y-3">
                {jobStatus?.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      index === jobStatus.current_step
                        ? 'border-blue-500 bg-blue-50'
                        : step.status === 'completed'
                        ? 'border-green-300 bg-green-50'
                        : step.status === 'failed'
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getStepIcon(step.status)}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-800">
                            {lang === 'en' ? step.name_en : step.name_es}
                          </h3>
                          <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(step.status)}`}>
                            {step.status}
                          </span>
                        </div>
                        {step.output && (
                          <pre className="text-sm text-gray-600 mt-2 whitespace-pre-wrap overflow-auto max-h-32 bg-gray-50 p-2 rounded">
                            {step.output.substring(0, 500)}{step.output.length > 500 ? '...' : ''}
                          </pre>
                        )}
                        {step.error && (
                          <p className="text-sm text-red-600 mt-2">{step.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* User Input Prompt */}
              {renderUserInputPrompt()}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-800 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            {t.footer.opensource} | <a href="https://github.com/JaRufoMarquez/Any-Windows-Contabo-VPS" className="underline hover:text-blue-300" target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
