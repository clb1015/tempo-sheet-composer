
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as XLSX from 'xlsx';

interface FileUploadProps {
  accept: string;
  onFileSelect: (file: File) => void;
  onDataLoad?: (file: File, data: any[]) => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  onFileSelect,
  onDataLoad,
  icon,
  title,
  description
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processSpreadsheet = async (file: File) => {
    return new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          // Validate required columns
          const requiredColumns = [
            'course_title', 'unit_title', 'standards_benchmarks', 'concepts_content',
            'pacing', 'learning_goals', 'learning_targets', 'vocabulary',
            'formative_assessment', 'summative_assessment', 'life_skills_competencies',
            'resources_examples'
          ];
          
          if (jsonData.length > 0) {
            const firstRow = jsonData[0] as any;
            const missingColumns = requiredColumns.filter(col => !(col in firstRow));
            
            if (missingColumns.length > 0) {
              reject(new Error(`Missing required columns: ${missingColumns.join(', ')}`));
              return;
            }
          }
          
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setError(null);
    setIsProcessing(true);

    try {
      onFileSelect(file);

      // If this is a spreadsheet and we have a data callback, process it
      if (onDataLoad && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv'))) {
        const data = await processSpreadsheet(file);
        onDataLoad(file, data);
      }
    } catch (error) {
      console.error('File processing error:', error);
      setError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      setIsProcessing(false);
    }
  }, [onFileSelect, onDataLoad]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => {
      acc[type.trim()] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <div className="space-y-4">
      <Card className={`cursor-pointer transition-all duration-200 ${
        isDragActive 
          ? 'border-blue-500 bg-blue-50 scale-105' 
          : 'border-dashed border-2 border-gray-300 hover:border-gray-400'
      } ${isProcessing ? 'opacity-50' : ''}`}>
        <CardContent {...getRootProps()} className="flex flex-col items-center justify-center p-8">
          <input {...getInputProps()} />
          
          <div className={`transition-transform duration-200 ${isDragActive ? 'scale-110' : ''}`}>
            {isProcessing ? (
              <div className="animate-spin">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
            ) : (
              icon
            )}
          </div>
          
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {isProcessing ? 'Processing...' : title}
          </h3>
          
          <p className="mt-2 text-sm text-gray-600 text-center">
            {isProcessing ? 'Please wait while we process your file' : description}
          </p>
          
          <p className="mt-1 text-xs text-gray-500">
            Supported formats: {accept}
          </p>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileUpload;
