
import React from 'react';
import { Table, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DataPreviewProps {
  data: any[];
}

const DataPreview: React.FC<DataPreviewProps> = ({ data }) => {
  const sampleRow = data[0] || {};
  const columns = Object.keys(sampleRow);

  const requiredColumns = [
    'course_title', 'unit_title', 'standards_benchmarks', 'concepts_content',
    'pacing', 'learning_goals', 'learning_targets', 'vocabulary',
    'formative_assessment', 'summative_assessment', 'life_skills_competencies',
    'resources_examples'
  ];

  const hasAllRequired = requiredColumns.every(col => columns.includes(col));

  return (
    <Card className={`${hasAllRequired ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${hasAllRequired ? 'text-green-800' : 'text-yellow-800'}`}>
          <CheckCircle className="w-5 h-5" />
          Spreadsheet Data Loaded
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-white rounded-lg border">
            <p className="text-sm text-gray-600">Total Rows</p>
            <p className="text-2xl font-bold text-blue-600">{data.length}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border">
            <p className="text-sm text-gray-600">Columns Found</p>
            <p className="text-2xl font-bold text-green-600">{columns.length}</p>
          </div>
          <div className="p-3 bg-white rounded-lg border">
            <p className="text-sm text-gray-600">Pages to Generate</p>
            <p className="text-2xl font-bold text-purple-600">{data.length}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Column Mapping</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {requiredColumns.map((requiredCol) => {
              const found = columns.includes(requiredCol);
              return (
                <div key={requiredCol} className="flex items-center gap-2">
                  <Badge 
                    variant={found ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {found ? "✓" : "✗"}
                  </Badge>
                  <span className={`text-sm ${found ? 'text-gray-700' : 'text-red-600'}`}>
                    {requiredCol}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {data.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Sample Data (First Row)</h4>
            <div className="bg-white rounded-lg border p-4 max-h-40 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2 text-sm">
                {Object.entries(sampleRow).slice(0, 5).map(([key, value]) => (
                  <div key={key} className="flex">
                    <span className="font-medium text-gray-600 w-32 flex-shrink-0">{key}:</span>
                    <span className="text-gray-800 truncate">{String(value)}</span>
                  </div>
                ))}
                {Object.keys(sampleRow).length > 5 && (
                  <p className="text-gray-500 italic">...and {Object.keys(sampleRow).length - 5} more columns</p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DataPreview;
