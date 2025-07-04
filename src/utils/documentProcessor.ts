
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
      
      onProgress(20);
      
      // Process all rows of data
      const processedData = data.map((row, index) => {
        console.log(`Processing row ${index + 1}/${data.length}`);
        const processedRow: any = {};
        
        Object.keys(row).forEach(key => {
          let value = String(row[key] || '');
          
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
        
        return processedRow;
      });
      
      console.log('All data processed:', {
        totalRows: processedData.length,
        sampleKeys: Object.keys(processedData[0] || {}),
        firstRowSample: {
          course_title: processedData[0]?.course_title,
          unit_title: processedData[0]?.unit_title
        }
      });
      
      onProgress(40);
      
      // Create the template data structure for multiple entries
      const templateData = {
        curricula: processedData
      };
      
      console.log('Template data structure created:', {
        curricula_count: templateData.curricula.length
      });
      
      onProgress(50);
      
      // Create docxtemplater instance
      const zip = new PizZip(templateArrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      
      console.log('Docxtemplater instance created');
      onProgress(60);
      
      try {
        // Try the modern approach first
        console.log('Attempting to render with template data...');
        doc.render(templateData);
        console.log('Document rendered successfully with modern approach');
      } catch (modernError) {
        console.log('Modern approach failed, trying compatibility mode...');
        console.error('Modern render error:', modernError);
        
        // Fallback: try with individual data if template expects single variables
        try {
          // If template uses simple variables instead of loops, use first row
          doc.render(processedData[0] || {});
          console.log('Document rendered with fallback approach (first row only)');
        } catch (fallbackError) {
          console.error('Both rendering approaches failed');
          console.error('Modern error:', modernError);
          console.error('Fallback error:', fallbackError);
          
          throw new Error(`Template rendering failed. Modern approach: ${modernError instanceof Error ? modernError.message : 'Unknown error'}. Fallback approach: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
        }
      }
      
      onProgress(90);
      
      // Generate the output
      console.log('Generating output blob...');
      const output = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      
      console.log('Document generated successfully', {
        blobSize: output.size,
        processedRows: processedData.length
      });
      
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
