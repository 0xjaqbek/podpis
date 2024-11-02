// PDF generation configuration and utilities
const PDF_CONFIG = {
    pageMargins: 20,
    lineHeight: 7,
    fontSize: {
        title: 20,
        normal: 12
    }
};

// Consent text constants
const CONSENT_TEXT = `Ja, niżej podpisany(a), wyrażam zgodę na udzielanie świadczeń zdrowotnych. Potwierdzam, że zostałem(am) poinformowany(a) o moim stanie zdrowia, proponowanych metodach diagnostycznych i leczniczych oraz o możliwych powikłaniach i ryzyku. Oświadczam również, że podane przeze mnie informacje są zgodne z prawdą.`;

const RODO_TEXT = `Zgodnie z art. 13 ust. 1 i 2 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych (RODO), wyrażam zgodę na przetwarzanie moich danych osobowych w celu realizacji usług medycznych i prowadzenia dokumentacji medycznej.`;

// Helper function to add text with proper line breaks
function addTextWithLineBreak(doc, text, x, y, maxWidth) {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * PDF_CONFIG.lineHeight);
}

// Helper function to check if we need a new page
function checkAndAddNewPage(doc, yPosition, requiredSpace) {
    if (yPosition + requiredSpace > 280) { // A4 height minus margins
        doc.addPage();
        return PDF_CONFIG.pageMargins;
    }
    return yPosition;
}

// Helper function to format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Main PDF generation function
function generatePDF(formData) {
    const doc = new jsPDF();
    
    // Configure PDF for Polish characters
    doc.setLanguage("pl");
    doc.setFont("helvetica");
    
    // Add title
    doc.setFontSize(PDF_CONFIG.fontSize.title);
    doc.text('Historia Medyczna i Formularz Zgody', PDF_CONFIG.pageMargins, PDF_CONFIG.pageMargins);
    
    // Set normal font size for content
    doc.setFontSize(PDF_CONFIG.fontSize.normal);
    let yPosition = 40;
    
    // Add patient information
    const patientInfo = [
        `Imię i Nazwisko: ${formData.name}`,
        `PESEL: ${formData.pesel}`,
        `Data urodzenia: ${formatDate(formData.dob)}`,
        `Adres: ${formData.address}`
    ];
    
    patientInfo.forEach(info => {
        yPosition = addTextWithLineBreak(doc, info, PDF_CONFIG.pageMargins, yPosition, 170);
        yPosition += 3;
    });
    
    yPosition += 5;
    
    // Add medical conditions
    yPosition = checkAndAddNewPage(doc, yPosition, 40);
    yPosition = addTextWithLineBreak(
        doc,
        `Choroby przewlekłe: ${formData.conditions}`,
        PDF_CONFIG.pageMargins,
        yPosition,
        170
    );
    
    if (formData.conditionsDescription) {
        yPosition += 5;
        yPosition = checkAndAddNewPage(doc, yPosition, 30);
        yPosition = addTextWithLineBreak(
            doc,
            formData.conditionsDescription,
            PDF_CONFIG.pageMargins,
            yPosition,
            170
        );
    }
    
    yPosition += 10;
    
    // Add medications
    yPosition = checkAndAddNewPage(doc, yPosition, 40);
    yPosition = addTextWithLineBreak(
        doc,
        'Przyjmowane leki:',
        PDF_CONFIG.pageMargins,
        yPosition,
        170
    );
    yPosition += 5;
    yPosition = addTextWithLineBreak(
        doc,
        formData.medications || 'Brak',
        PDF_CONFIG.pageMargins,
        yPosition,
        170
    );
    
    yPosition += 10;
    
    // Add allergies
    yPosition = checkAndAddNewPage(doc, yPosition, 40);
    yPosition = addTextWithLineBreak(
        doc,
        'Alergie:',
        PDF_CONFIG.pageMargins,
        yPosition,
        170
    );
    yPosition += 5;
    yPosition = addTextWithLineBreak(
        doc,
        formData.allergies || 'Brak',
        PDF_CONFIG.pageMargins,
        yPosition,
        170
    );
    
    yPosition += 15;
    
    // Add consent section
    yPosition = checkAndAddNewPage(doc, yPosition, 60);
    doc.setFontSize(14);
    doc.text('Zgoda na świadczenia medyczne', PDF_CONFIG.pageMargins, yPosition);
    doc.setFontSize(PDF_CONFIG.fontSize.normal);
    yPosition += 10;
    yPosition = addTextWithLineBreak(
        doc,
        CONSENT_TEXT,
        PDF_CONFIG.pageMargins,
        yPosition,
        170
    );
    
    yPosition += 15;
    
    // Add RODO section
    yPosition = checkAndAddNewPage(doc, yPosition, 60);
    doc.setFontSize(14);
    doc.text('Informacja RODO', PDF_CONFIG.pageMargins, yPosition);
    doc.setFontSize(PDF_CONFIG.fontSize.normal);
    yPosition += 10;
    yPosition = addTextWithLineBreak(
        doc,
        RODO_TEXT,
        PDF_CONFIG.pageMargins,
        yPosition,
        170
    );
    
    yPosition += 15;
    
    // Add signature section
    yPosition = checkAndAddNewPage(doc, yPosition, 50);
    doc.text('Podpis pacjenta:', PDF_CONFIG.pageMargins, yPosition);
    
    // Add signature image
    if (formData.signature) {
        doc.addImage(
            formData.signature,
            'PNG',
            PDF_CONFIG.pageMargins,
            yPosition + 5,
            50,
            20
        );
    }
    
    // Add date
    const currentDate = new Date().toLocaleDateString('pl-PL');
    doc.text(
        `Data: ${currentDate}`,
        PDF_CONFIG.pageMargins,
        yPosition + 30
    );
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
            `Strona ${i} z ${pageCount}`,
            doc.internal.pageSize.getWidth() - 40,
            doc.internal.pageSize.getHeight() - 10
        );
    }
    
    // Download the PDF
    const fileName = `zgoda_medyczna_${formData.name.replace(/\s+/g, '_')}_${
        new Date().toISOString().split('T')[0]
    }.pdf`;
    
    doc.save(fileName);
}
