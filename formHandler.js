let signaturePad;

// Initialize signature pad on page load
window.onload = function() {
    initializeSignaturePad();
};

// Initialize and configure the signature pad
function initializeSignaturePad() {
    const canvas = document.getElementById('signaturePad');
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
    signaturePad.clear();
}

// Form submission handler
function handleSubmit(event) {
    event.preventDefault();
    
    // Validate signature
    if (signaturePad.isEmpty()) {
        alert('Proszę złożyć podpis');
        return false;
    }
    
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
    generatePDF(formData);
    
    return false;
}

// PESEL validation
document.getElementById('pesel').addEventListener('input', function(e) {
    const value = e.target.value;
    if (value.length === 11 && !/^\d{11}$/.test(value)) {
        e.target.setCustomValidity('PESEL musi zawierać tylko cyfry');
    } else {
        e.target.setCustomValidity('');
    }
});
