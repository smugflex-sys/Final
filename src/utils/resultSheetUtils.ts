import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const printResultSheet = async (elementId: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Could not open print window');
    return;
  }

  // Copy the content to the new window
  const elementClone = element.cloneNode(true) as HTMLElement;
  
  // Add print-specific styles
  const printStyles = `
    <style>
      @page {
        size: A4;
        margin: 0.5in;
      }
      body {
        font-family: Arial, sans-serif;
        font-size: 12px;
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      table {
        page-break-inside: avoid;
        border-collapse: collapse;
      }
      tr {
        page-break-inside: avoid;
      }
      td, th {
        border: 1px solid black;
      }
      .signature-section {
        page-break-inside: avoid;
      }
    </style>
  `;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Student Result Sheet</title>
        ${printStyles}
      </head>
      <body>
        ${elementClone.innerHTML}
      </body>
    </html>
  `);

  printWindow.document.close();
  
  // Wait for the content to load, then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

export const downloadResultSheetAsPDF = async (elementId: string, filename: string = 'result-sheet.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    // Hide action buttons before capturing
    const actionButtons = element.querySelector('.flex.justify-center.space-x-4');
    if (actionButtons) {
      (actionButtons as HTMLElement).style.display = 'none';
    }

    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: element.scrollWidth,
      height: element.scrollHeight
    });

    // Restore action buttons
    if (actionButtons) {
      (actionButtons as HTMLElement).style.display = 'flex';
    }

    // Calculate PDF dimensions
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

export const generateResultSheetFilename = (studentName: string, term: string, academicYear: string): string => {
  const cleanName = studentName.replace(/[^a-zA-Z0-9]/g, '_');
  return `${cleanName}_${term}_${academicYear}_result_sheet.pdf`;
};

export const calculateClassStatistics = (scores: any[]): any => {
  if (!scores || scores.length === 0) {
    return {
      average: 0,
      minimum: 0,
      maximum: 0,
      total: 0
    };
  }

  const totals = scores.map(score => score.total || 0);
  const total = totals.reduce((sum, total) => sum + total, 0);
  const average = total / totals.length;
  const minimum = Math.min(...totals);
  const maximum = Math.max(...totals);

  return {
    average: average.toFixed(1),
    minimum,
    maximum,
    total
  };
};

export const getGradeColor = (grade: string): string => {
  switch (grade) {
    case 'A': return '#10b981'; // green
    case 'B': return '#3b82f6'; // blue
    case 'C': return '#f59e0b'; // amber
    case 'D': return '#f97316'; // orange
    case 'E': return '#ef4444'; // red
    case 'F': return '#991b1b'; // dark red
    default: return '#6b7280'; // gray
  }
};

export const formatNumber = (num: number, decimals: number = 1): string => {
  return num.toFixed(decimals);
};
