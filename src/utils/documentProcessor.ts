
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

export const processDocument = async (
  templateFile: File,
  data: any[],
  onProgress: (progress: number) => void
): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Starting document processing...', {
        templateFile: templateFile.name,
        templateSize: templateFile.size,
        dataLength: data.length
      });
      
      onProgress(10);
      
      // Read the template file
      const templateArrayBuffer = await templateFile.arrayBuffer();
      console.log('Template file read successfully, size:', templateArrayBuffer.byteLength);
      
      const zip = new PizZip(templateArrayBuffer);
      
      onProgress(20);
      
      // Create docxtemplater instance
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      
      console.log('Docxtemplater instance created');
      onProgress(30);
      
      // Process the first row of data to understand structure
      const firstRow = data[0] || {};
      console.log('First row keys:', Object.keys(firstRow));
      console.log('First row sample values:', {
        course_title: firstRow.course_title,
        unit_title: firstRow.unit_title,
        standards_benchmarks: firstRow.standards_benchmarks
      });
      
      // Convert <br> tags to line breaks for the first row
      const processedRow: any = {};
      Object.keys(firstRow).forEach(key => {
        let value = String(firstRow[key] || '');
        
        // Handle <br> tags - convert to line breaks
        if (value.includes('<br>')) {
          const parts = value.split('<br>').filter(part => part.trim());
          if (parts.length > 1) {
            // Create bullet points for multiple items
            value = parts.map(part => `• ${part.trim()}`).join('\n');
          } else {
            value = value.replace(/<br>/g, '\n');
          }
        }
        
        processedRow[key] = value;
      });
      
      console.log('Processed row keys:', Object.keys(processedRow));
      console.log('Processed row sample:', {
        course_title: processedRow.course_title,
        unit_title: processedRow.unit_title,
        standards_benchmarks: processedRow.standards_benchmarks
      });
      
      onProgress(50);
      
      // Try the simplest approach first - just use the first row data directly
      console.log('Setting template data with processed row...');
      
      try {
        // Use setData and render (older but more reliable method)
        doc.setData(processedRow);
        console.log('Data set successfully on template');
        
        onProgress(70);
        
        console.log('Rendering document...');
        doc.render();
        console.log('Document rendered successfully');
        
      } catch (renderError) {
        console.error('Rendering failed:', renderError);
        console.log('Template tags found in document:', doc.getFullText ? doc.getFullText() : 'Cannot read template content');
        
        // Log the exact error details
        if (renderError instanceof Error) {
          console.error('Render error message:', renderError.message);
          console.error('Render error stack:', renderError.stack);
        }
        
        throw new Error(`Template rendering failed: ${renderError instanceof Error ? renderError.message : 'Unknown rendering error'}`);
      }
      
      onProgress(90);
      
      // Generate the output
      console.log('Generating output blob...');
      const output = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      
      console.log('Document generated successfully, blob size:', output.size);
      onProgress(100);
      resolve(output);
      
    } catch (error) {
      console.error('Document processing error:', error);
      
      // Provide detailed error information
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      reject(new Error(`Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
};
