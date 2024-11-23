// Get jsPDF from the UMD module
const { jsPDF } = window.jspdf;

// PDF generation configuration and utilities
const PDF_CONFIG = {
    pageMargins: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20
    },
    lineHeight: 5,
    fontSize: {
        title: 14,
        subtitle: 12,
        normal: 9,
        small: 7
    },
    maxWidth: 170,
    logoSize: {
        width: 30,
        height: 30
    }
};

const LOGO_PATH = './hb-removebg-preview.png';

// Consent text constants
const CONSENT_TEXT = `Ja, niżej podpisany(a), wyrażam zgodę na udzielanie świadczeń zdrowotnych. Potwierdzam, że zostałem(am) poinformowany(a) o moim stanie zdrowia, proponowanych metodach diagnostycznych i leczniczych oraz o możliwych powikłaniach i ryzyku. Oświadczam również, że podane przeze mnie informacje są zgodne z prawdą.`;

const RODO_TEXT = `Zgodnie z art. 13 ust. 1 i 2 Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych (RODO), wyrażam zgodę na przetwarzanie moich danych osobowych w celu realizacji usług medycznych i prowadzenia dokumentacji medycznej.`;

// Helper function to properly encode Polish characters
function encodePolishChars(text) {
    const polishCharsMap = {
        'ą': 'a',
        'ć': 'c',
        'ę': 'e',
        'ł': 'l',
        'ń': 'n',
        'ó': 'o',
        'ś': 's',
        'ź': 'z',
        'ż': 'z',
        'Ą': 'A',
        'Ć': 'C',
        'Ę': 'E',
        'Ł': 'L',
        'Ń': 'N',
        'Ó': 'O',
        'Ś': 'S',
        'Ź': 'Z',
        'Ż': 'Z'
    };
    
    return text.replace(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, char => polishCharsMap[char] || char);
}

// Helper function to add text with proper line breaks and margins
function addTextWithLineBreak(doc, text, x, y, maxWidth, fontSize = PDF_CONFIG.fontSize.normal) {
    doc.setFontSize(fontSize);
    
    // Calculate effective width considering right margin
    const effectiveWidth = maxWidth - (PDF_CONFIG.pageMargins.right * 2);
    
    // Split text into lines with proper width
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    
    words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = doc.getStringUnitWidth(testLine) * fontSize;
        
        if (testWidth > effectiveWidth) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    });
    
    if (currentLine) {
        lines.push(currentLine);
    }
    
    // Add each line with proper encoding
    lines.forEach((line, index) => {
        const encodedLine = encodePolishChars(line);
        doc.text(encodedLine, x, y + (index * PDF_CONFIG.lineHeight));
    });
    
    return y + (lines.length * PDF_CONFIG.lineHeight);
}

// Helper function to check if we need a new page
function checkAndAddNewPage(doc, yPosition, requiredSpace) {
    if (yPosition + requiredSpace > (doc.internal.pageSize.getHeight() - PDF_CONFIG.pageMargins.bottom)) {
        doc.addPage();
        return PDF_CONFIG.pageMargins.top;
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
    // Create new document with Polish language support
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true
    });
    
    // Configure PDF for Polish characters
    doc.setLanguage("pl");
    doc.addFont("helvetica", "Helvetica", "normal");
    doc.setFont("Helvetica");
    
    // Add logo
    doc.addImage(
        LOGO_PATH,
        'PNG',
        PDF_CONFIG.pageMargins.left,
        PDF_CONFIG.pageMargins.top,
        PDF_CONFIG.logoSize.width,
        PDF_CONFIG.logoSize.height
    );
    
    // Add title
    doc.setFontSize(PDF_CONFIG.fontSize.title);
    const title = encodePolishChars('Historia Medyczna i Formularz Zgody');
    doc.text(
        title,
        PDF_CONFIG.pageMargins.left + PDF_CONFIG.logoSize.width + 10,
        PDF_CONFIG.pageMargins.top + (PDF_CONFIG.logoSize.height / 2)
    );
    
    // Set normal font size for content
    doc.setFontSize(PDF_CONFIG.fontSize.normal);
    let yPosition = PDF_CONFIG.pageMargins.top + PDF_CONFIG.logoSize.height + 10;
    
    // Add patient information
    const patientInfo = [
        `Imię i Nazwisko: ${formData.name}`,
        `PESEL: ${formData.pesel}`,
        `Data urodzenia: ${formatDate(formData.dob)}`,
        `Adres: ${formData.address}`
    ];
    
    patientInfo.forEach(info => {
        yPosition = addTextWithLineBreak(
            doc, 
            info, 
            PDF_CONFIG.pageMargins.left, 
            yPosition, 
            PDF_CONFIG.maxWidth
        );
        yPosition += 2;
    });
    
    yPosition += 5;
    
    // Add medical conditions
    yPosition = checkAndAddNewPage(doc, yPosition, 30);
    yPosition = addTextWithLineBreak(
        doc,
        `Choroby przewlekłe: ${formData.conditions}`,
        PDF_CONFIG.pageMargins.left,
        yPosition,
        PDF_CONFIG.maxWidth
    );
    
    if (formData.conditionsDescription) {
        yPosition += 3;
        yPosition = checkAndAddNewPage(doc, yPosition, 20);
        yPosition = addTextWithLineBreak(
            doc,
            formData.conditionsDescription,
            PDF_CONFIG.pageMargins.left + 5,
            yPosition,
            PDF_CONFIG.maxWidth - 5
        );
    }
    
    yPosition += 5;
    
    // Add medications
    yPosition = checkAndAddNewPage(doc, yPosition, 30);
    yPosition = addTextWithLineBreak(
        doc,
        'Przyjmowane leki:',
        PDF_CONFIG.pageMargins.left,
        yPosition,
        PDF_CONFIG.maxWidth
    );
    yPosition += 3;
    yPosition = addTextWithLineBreak(
        doc,
        formData.medications || 'Brak',
        PDF_CONFIG.pageMargins.left + 5,
        yPosition,
        PDF_CONFIG.maxWidth - 5
    );
    
    yPosition += 5;
    
    // Add allergies
    yPosition = checkAndAddNewPage(doc, yPosition, 30);
    yPosition = addTextWithLineBreak(
        doc,
        'Alergie:',
        PDF_CONFIG.pageMargins.left,
        yPosition,
        PDF_CONFIG.maxWidth
    );
    yPosition += 3;
    yPosition = addTextWithLineBreak(
        doc,
        formData.allergies || 'Brak',
        PDF_CONFIG.pageMargins.left + 5,
        yPosition,
        PDF_CONFIG.maxWidth - 5
    );
    
    yPosition += 10;
    
    // Add consent section with smaller text and proper margins
    yPosition = checkAndAddNewPage(doc, yPosition, 10);
    doc.setFontSize(PDF_CONFIG.fontSize.subtitle);
    doc.text(
        encodePolishChars('Zgoda na świadczenia medyczne'),
        PDF_CONFIG.pageMargins.left,
        yPosition
    );
    yPosition += 7;
    
    // Use reduced width for consent text
    const consentWidth = PDF_CONFIG.maxWidth - 10; // Increased margin reduction
    yPosition = addTextWithLineBreak(
        doc,
        CONSENT_TEXT,
        PDF_CONFIG.pageMargins.left + 2, // Add left indentation
        yPosition,
        consentWidth,
        PDF_CONFIG.fontSize.small
    );
    
    yPosition += 10;
    
    // Add RODO section with smaller text and proper margins
    yPosition = checkAndAddNewPage(doc, yPosition, 10);
    doc.setFontSize(PDF_CONFIG.fontSize.subtitle);
    doc.text(
        encodePolishChars('Informacja RODO'),
        PDF_CONFIG.pageMargins.left,
        yPosition
    );
    yPosition += 7;
    
    // Use same reduced width for RODO text
    yPosition = addTextWithLineBreak(
        doc,
        RODO_TEXT,
        PDF_CONFIG.pageMargins.left + 2, // Add left indentation
        yPosition,
        consentWidth,
        PDF_CONFIG.fontSize.small
    );
    
    yPosition += 10;
    
    // Add signature section
    yPosition = checkAndAddNewPage(doc, yPosition, 40);
    doc.setFontSize(PDF_CONFIG.fontSize.normal);
    doc.text(
        encodePolishChars('Podpis pacjenta:'),
        PDF_CONFIG.pageMargins.left,
        yPosition
    );
    
    // Add signature image
    if (formData.signature) {
        doc.addImage(
            formData.signature,
            'PNG',
            PDF_CONFIG.pageMargins.left,
            yPosition + 5,
            50,
            20
        );
    }
    
    // Add date
    const currentDate = new Date().toLocaleDateString('pl-PL');
    doc.text(
        `Data: ${currentDate}`,
        PDF_CONFIG.pageMargins.left,
        yPosition + 30
    );
    
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(PDF_CONFIG.fontSize.small);
        doc.text(
            `Strona ${i} z ${pageCount}`,
            doc.internal.pageSize.getWidth() - 40,
            doc.internal.pageSize.getHeight() - 10
        );
    }
    
    // Download the PDF with Polish characters in filename
    const fileName = `zgoda_medyczna_${formData.name.replace(/\s+/g, '_')}_${
        new Date().toISOString().split('T')[0]
    }.pdf`;
    
    doc.save(fileName);
}