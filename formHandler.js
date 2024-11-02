// Global variables
let signaturePad;

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
});

function initializeForm() {
    // Initialize signature pad
    const canvas = document.getElementById('signaturePad');
    if (canvas) {
        initializeSignaturePad(canvas);
    }

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

    // Set up clear button
    const clearButton = document.getElementById('clearButton');
    if (clearButton) {
        clearButton.addEventListener('click', clearSignature);
    }
}

// Initialize and configure the signature pad
function initializeSignaturePad(canvas) {
    signaturePad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255, 255, 255)'
    });
    
    // Handle canvas resize
    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear();
    }
    
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
}

// Clear signature pad
function clearSignature() {
    if (signaturePad) {
        signaturePad.clear();
    }
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
    
    if (!signaturePad || signaturePad.isEmpty()) {
        alert('Proszę złożyć podpis');
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
