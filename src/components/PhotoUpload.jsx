// src/components/PhotoUpload.jsx
import { useState, useRef, useEffect } from 'react';

// Cliente
function ClientPhotoUpload() {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  };

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    await processFiles(selectedFiles);
  };

  const processFiles = async (fileList) => {
    // Importar exifr solo en cliente
    const exifr = await import('exifr');
    const newFiles = [];
    
    for (const file of fileList) {
      if (file.type.startsWith('image/')) {
        try {
          const exifData = await exifr.parse(file);
          
          if (exifData?.latitude && exifData?.longitude) {
            newFiles.push({
              file,
              name: file.name,
              latitude: exifData.latitude,
              longitude: exifData.longitude,
              timestamp: exifData.DateTimeOriginal,
              hasGPS: true
            });
          } else {
            newFiles.push({
              file,
              name: file.name,
              hasGPS: false,
              error: 'No se encontraron datos GPS'
            });
          }
        } catch (error) {
          newFiles.push({
            file,
            name: file.name,
            hasGPS: false,
            error: 'Error leyendo metadatos'
          });
        }
      }
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const submitFiles = () => {
    const filesWithGPS = files.filter(f => f.hasGPS);
    if (filesWithGPS.length > 0) {
      alert(`${filesWithGPS.length} fotos con GPS enviadas para aprobación`);
      setFiles([]);
    }
  };

  if (!isClient) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-20 mx-4">
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 mt-20 mx-4">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Subir Fotos con GPS</h2>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
          </svg>
          <p className="text-lg mb-2 text-gray-700">Arrastra tus fotos aquí o haz click</p>
          <p className="text-sm text-gray-500">Solo se aceptan fotos con datos GPS</p>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {files.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3 text-lg text-gray-800">Fotos subidas:</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    {file.hasGPS ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    )}
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      {file.hasGPS ? (
                        <p className="text-sm text-green-600">
                          GPS: {file.latitude?.toFixed(6)}, {file.longitude?.toFixed(6)}
                        </p>
                      ) : (
                        <p className="text-sm text-red-600">{file.error}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button 
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                onClick={submitFiles}
                disabled={!files.some(f => f.hasGPS)}
              >
                Enviar para Aprobación ({files.filter(f => f.hasGPS).length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PhotoUpload() {
  return <ClientPhotoUpload />;
}