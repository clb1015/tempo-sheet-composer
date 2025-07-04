
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
      
      // Process each row of data
      const processedData = data.map((row, index) => {
        onProgress(30 + (index / data.length) * 50);
        
        // Convert <br> tags to line breaks and handle formatting
        const processedRow: any = {};
        
        Object.keys(row).forEach(key => {
          let value = String(row[key] || '');
          
          // Handle <br> tags - convert to line breaks with bullet points where appropriate
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
      
      console.log('Data processed:', processedData.length, 'rows');
      onProgress(80);
      
      // For multiple pages, we need to handle each curriculum entry
      // For now, we'll use the first row as an example
      const documentData = processedData[0] || {};
      
      console.log('Document data prepared:', documentData);
      
      // Set the template variables
      doc.setData(documentData);
      
      onProgress(90);
      
      try {
        // Render the document
        console.log('Rendering document...');
        doc.render();
        console.log('Document rendered successfully');
      } catch (error) {
        console.error('Template rendering error:', error);
        // If rendering fails, try with a simplified approach
        reject(new Error(`Template rendering failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
        return;
      }
      
      onProgress(95);
      
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
      reject(new Error(`Document processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
};
