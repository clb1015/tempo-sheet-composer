
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface GenerationProgressProps {
  progress: number;
}

const GenerationProgress: React.FC<GenerationProgressProps> = ({ progress }) => {
  const getProgressMessage = (progress: number) => {
    if (progress < 10) return "Initializing document processor...";
    if (progress < 30) return "Loading template structure...";
    if (progress < 50) return "Processing spreadsheet data...";
    if (progress < 80) return "Generating curriculum pages...";
    if (progress < 95) return "Finalizing document...";
    return "Almost ready!";
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-blue-900">Generating Document</h3>
              <span className="text-sm text-blue-700 font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 mb-2" />
            <p className="text-sm text-blue-700">{getProgressMessage(progress)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GenerationProgress;
