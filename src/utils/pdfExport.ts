import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export function triggerPrint() {
  window.print();
}

export async function downloadElementAsPdf(
  elementId: string,
  filename: string,
  onProgress?: (isGenerating: boolean) => void
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  try {
    if (onProgress) onProgress(true);

    // Render element into high-dpi canvas
    const canvas = await html2canvas(element, {
      scale: 2, // 2x resolution for clean text
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');

    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Handle multi-page documents if content exceeds single A4 page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    const cleanFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(cleanFilename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to browser print if canvas fails
    triggerPrint();
  } finally {
    if (onProgress) onProgress(false);
  }
}
