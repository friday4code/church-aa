import jsPDF from 'jspdf';

export const TABLE_HEADER_COLOR = '#16365E';

export const addPdfHeader = async (doc: jsPDF, title: string, subtitle: string): Promise<void> => {
    const pageWidth = doc.internal.pageSize.width;

    try {
        // Load logo
        const logoUrl = '/logo.png';
        const logoImg = await loadImage(logoUrl);
        
        const centerX = pageWidth / 2;

        // Add Logo - centered
        doc.addImage(logoImg, 'PNG', centerX - 10, 10, 20, 20);

        // Add Main Title
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text('Church Attendance App', centerX, 38, { align: 'center' });

        // Add Section Title
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text(title, centerX, 46, { align: 'center' });
        
        // Add Subtitle (Export details)
        doc.setFontSize(10);
        doc.text(subtitle, centerX, 52, { align: 'center' });

        // Add Date
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Exported on: ${new Date().toLocaleDateString()}`, centerX, 58, { align: 'center' });

    } catch (error) {
        console.error('Error adding PDF header:', error);
        
        const centerX = pageWidth / 2;

        // Fallback if image fails - just render text
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text('Church Attendance App', centerX, 18, { align: 'center' });

        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.text(title, centerX, 26, { align: 'center' });
        
        doc.setFontSize(10);
        doc.text(subtitle, centerX, 34, { align: 'center' });

        doc.setFontSize(10);
        doc.text(`Exported on: ${new Date().toLocaleDateString()}`, centerX, 40, { align: 'center' });
    }
};

const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = reject;
    });
};
