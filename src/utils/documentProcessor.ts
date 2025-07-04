
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';

export const processDocument = async (
  templateFile: File,
  data: any[],
  onProgress: (progress: number) => void
): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      onProgress(10);
      
      // Read the template file
      const templateArrayBuffer = await templateFile.arrayBuffer();
      const zip = new PizZip(templateArrayBuffer);
      
      onProgress(20);
      
      // Create docxtemplater instance
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });
      
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
      
      onProgress(80);
      
      // For multiple pages, we need to duplicate the template content
      // This is a simplified approach - in a real implementation, you'd want to handle page breaks properly
      const documentData = {
        pages: processedData
      };
      
      // Set the template variables
      doc.setData(documentData);
      
      onProgress(90);
      
      try {
        // Render the document
        doc.render();
      } catch (error) {
        console.error('Template rendering error:', error);
        // If rendering fails, try with individual pages
        return processIndividualPages(templateFile, processedData, onProgress);
      }
      
      onProgress(95);
      
      // Generate the output
      const output = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      
      onProgress(100);
      resolve(output);
      
    } catch (error) {
      console.error('Document processing error:', error);
      reject(error);
    }
  });
};

// Fallback method to process individual pages
const processIndividualPages = async (
  templateFile: File,
  data: any[],
  onProgress: (progress: number) => void
): Promise<Blob> => {
  const templateArrayBuffer = await templateFile.arrayBuffer();
  
  // For simplicity, we'll create one document with all the data
  // In a production app, you'd want to handle page breaks and multiple templates
  const zip = new PizZip(templateArrayBuffer);
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });
  
  // Use the first row of data as a template
  if (data.length > 0) {
    doc.setData(data[0]);
    doc.render();
  }
  
  onProgress(100);
  
  return doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
};
