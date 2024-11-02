let signaturePad;
let hasSignature = false;

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
});

function initializeForm() {
    const openSignatureBtn = document.getElementById('openSignature');
    const signatureModal = document.getElementById('signatureModal');
    const confirmSignatureBtn = document.getElementById('confirmSignature');
    const clearSignatureBtn = document.getElementById('clearSignature');
    const cancelSignatureBtn = document.getElementById('cancelSignature');
    const changeSignatureBtn = document.getElementById('changeSignature');
    const signaturePreview = document.getElementById('signaturePreview');
    
    // Initialize signature pad
    const canvas = document.getElementById('signaturePad');
    initializeSignaturePad(canvas);
    
    // Set up form submission
    const form = document.getElementById('medicalForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
    
    // Set up PESEL validation
    const peselInput = document.getElementById('pesel');
    if (peselInput) {
        peselInput.addEventListener('input', validatePesel);
    }
    
    // Signature modal controls
    openSignatureBtn.addEventListener('click', function() {
        signatureModal.classList.add('active');
        resizeCanvas();
    });
    
    confirmSignatureBtn.addEventListener('click', function() {
        if (signaturePad.isEmpty()) {
            alert('Proszę złożyć podpis przed potwierdzeniem');
            return;
        }
        
        hasSignature = true;
        signatureModal.classList.remove('active');
        signaturePreview.classList.remove('hidden');
        openSignatureBtn.classList.add('hidden');
    });
    
    clearSignatureBtn.addEventListener('click', function() {
        signaturePad.clear();
    });
    
    cancelSignatureBtn.addEventListener('click', function() {
        signatureModal.classList.remove('active');
    });
    
    changeSignatureBtn.addEventListener('click', function() {
        signatureModal.classList.add('active');
        resizeCanvas();
    });

    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
}

// Initialize and configure the signature pad
function initializeSignaturePad(canvas) {
    signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)',
        penColor: 'rgb(0, 0, 0)'
    });
}

// Resize canvas
function resizeCanvas() {
    const canvas = document.getElementById('signaturePad');
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    canvas.getContext("2d").scale(ratio, ratio);
    signaturePad.clear();
}

// Validate PESEL
function validatePesel(e) {
    const value = e.target.value;
    if (value.length === 11 && !/^\d{11}$/.test(value)) {
        e.target.setCustomValidity('PESEL musi zawierać tylko cyfry');
    } else {
        e.target.setCustomValidity('');
    }
}

// Form submission handler
function handleSubmit(event) {
    event.preventDefault();
    
    if (!hasSignature) {
        alert('Proszę złożyć podpis przed wygenerowaniem dokumentu');
        return false;
    }
    
    try {
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            pesel: document.getElementById('pesel').value,
            dob: document.getElementById('dob').value,
            address: document.getElementById('address').value,
            conditions: document.querySelector('input[name="conditions"]:checked')?.value || 'nie określono',
            conditionsDescription: document.getElementById('conditions-description').value,
            medications: document.getElementById('medications').value,
            allergies: document.getElementById('allergies').value,
            signature: signaturePad.toDataURL()
        };
        
        // Generate and download PDF
        if (typeof generatePDF === 'function') {
            generatePDF(formData);
        } else {
            console.error('PDF generator not loaded');
            alert('Wystąpił błąd podczas generowania PDF. Proszę odświeżyć stronę.');
        }
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Wystąpił błąd podczas generowania PDF. Proszę spróbować ponownie.');
    }
    
    return false;
}
