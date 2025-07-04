
import React, { useState } from 'react';
import { Upload, FileText, Table, Download, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import FileUpload from '@/components/FileUpload';
import TemplatePreview from '@/components/TemplatePreview';
import DataPreview from '@/components/DataPreview';
import GenerationProgress from '@/components/GenerationProgress';

const Index = () => {
  const [step, setStep] = useState(1);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [spreadsheetFile, setSpreadsheetFile] = useState<File | null>(null);
  const [spreadsheetData, setSpreadsheetData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedFile, setGeneratedFile] = useState<Blob | null>(null);
  const { toast } = useToast();

  const handleTemplateUpload = (file: File) => {
    setTemplateFile(file);
    toast({
      title: "Template uploaded successfully",
      description: "Your DOCX template has been loaded.",
    });
  };

  const handleSpreadsheetUpload = (file: File, data: any[]) => {
    setSpreadsheetFile(file);
    setSpreadsheetData(data);
    toast({
      title: "Spreadsheet uploaded successfully",
      description: `Loaded ${data.length} curriculum records.`,
    });
  };

  const handleGenerate = async () => {
    if (!templateFile || !spreadsheetData.length) return;
    
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      console.log('Starting document generation...', {
        templateFile: templateFile.name,
        dataRows: spreadsheetData.length
      });
      
      // Import the document processor
      const { processDocument } = await import('@/utils/documentProcessor');
      
      const result = await processDocument(
        templateFile, 
        spreadsheetData,
        (progress) => {
          console.log('Generation progress:', progress);
          setGenerationProgress(progress);
        }
      );
      
      console.log('Document generated successfully', result);
      setGeneratedFile(result);
      setStep(4);
      toast({
        title: "Document generated successfully!",
        description: "Your curriculum document is ready for download.",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: "There was an error processing your files. Please check the template format.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedFile) {
      console.error('No generated file available for download');
      return;
    }
    
    console.log('Starting download...', generatedFile);
    
    try {
      // Create download link
      const url = URL.createObjectURL(generatedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Generated_Curriculum.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Your curriculum document is being downloaded.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the file.",
        variant: "destructive",
      });
    }
  };

  const canProceed = (currentStep: number) => {
    switch (currentStep) {
      case 1: return templateFile !== null;
      case 2: return spreadsheetFile !== null && spreadsheetData.length > 0;
      case 3: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Music Curriculum Generator
          </h1>
          <p className="text-xl text-gray-600">
            Transform your spreadsheet data into professional curriculum documents
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= stepNum 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {step > stepNum ? <CheckCircle className="w-6 h-6" /> : stepNum}
                </div>
                {stepNum < 4 && (
                  <div className={`w-16 h-1 ml-4 ${
                    step > stepNum ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-blue-600" />
                  Step 1: Upload Template
                </CardTitle>
                <CardDescription>
                  Upload your DOCX template with placeholders like {"{course_title}"}, {"{unit_title}"}, etc.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  accept="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onFileSelect={handleTemplateUpload}
                  icon={<FileText className="w-12 h-12 text-blue-500" />}
                  title="Drop your DOCX template here"
                  description="or click to browse"
                />
                {templateFile && (
                  <div className="mt-4">
                    <TemplatePreview file={templateFile} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="w-6 h-6 text-green-600" />
                  Step 2: Upload Spreadsheet
                </CardTitle>
                <CardDescription>
                  Upload your Excel or CSV file with curriculum data. Each row will create a new page.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                  onFileSelect={(file) => {
                    // This will be handled by the component
                  }}
                  onDataLoad={handleSpreadsheetUpload}
                  icon={<Table className="w-12 h-12 text-green-500" />}
                  title="Drop your spreadsheet here"
                  description="Excel (.xlsx, .xls) or CSV files supported"
                />
                {spreadsheetData.length > 0 && (
                  <div className="mt-4">
                    <DataPreview data={spreadsheetData} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-6 h-6 text-purple-600" />
                  Step 3: Generate Document
                </CardTitle>
                <CardDescription>
                  Ready to generate your curriculum document with {spreadsheetData.length} pages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Template</h3>
                    <p className="text-blue-700">{templateFile?.name}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">Data Source</h3>
                    <p className="text-green-700">{spreadsheetFile?.name}</p>
                    <p className="text-sm text-green-600">{spreadsheetData.length} curriculum entries</p>
                  </div>
                </div>
                
                {isGenerating ? (
                  <GenerationProgress progress={generationProgress} />
                ) : (
                  <Button 
                    onClick={handleGenerate} 
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
                    size="lg"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Generate Curriculum Document
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  Step 4: Download Complete
                </CardTitle>
                <CardDescription>
                  Your curriculum document has been generated successfully!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-6 bg-green-50 rounded-lg text-center">
                  <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-900 mb-2">
                    Document Ready!
                  </h3>
                  <p className="text-green-700 mb-4">
                    Generated {spreadsheetData.length} curriculum pages from your template
                  </p>
                </div>
                
                <Button 
                  onClick={handleDownload} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                  size="lg"
                  disabled={!generatedFile}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Curriculum Document
                </Button>
                
                <Button 
                  onClick={() => {
                    setStep(1);
                    setTemplateFile(null);
                    setSpreadsheetFile(null);
                    setSpreadsheetData([]);
                    setGeneratedFile(null);
                    setGenerationProgress(0);
                  }} 
                  variant="outline"
                  className="w-full"
                >
                  Start New Generation
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        {step < 4 && (
          <div className="flex justify-between mt-8">
            <Button 
              onClick={() => setStep(Math.max(1, step - 1))} 
              variant="outline"
              disabled={step === 1}
            >
              Previous
            </Button>
            <Button 
              onClick={() => setStep(Math.min(4, step + 1))} 
              disabled={!canProceed(step)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
