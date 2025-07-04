
import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TemplatePreviewProps {
  file: File;
}

const TemplatePreview: React.FC<TemplatePreviewProps> = ({ file }) => {
  const placeholders = [
    'course_title', 'unit_title', 'standards_benchmarks', 'concepts_content',
    'pacing', 'learning_goals', 'learning_targets', 'vocabulary',
    'formative_assessment', 'summative_assessment', 'life_skills_competencies',
    'resources_examples'
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-800">
          <CheckCircle className="w-5 h-5" />
          Template Loaded Successfully
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
          <FileText className="w-8 h-8 text-blue-600" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{file.name}</p>
            <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Expected Placeholders</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {placeholders.map((placeholder) => (
              <Badge key={placeholder} variant="outline" className="text-xs">
                {`{${placeholder}}`}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Make sure your template includes these placeholders in curly braces.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplatePreview;
