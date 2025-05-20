// DOM Elements
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const analyzeImageButton = document.getElementById('analyzeImage');
const painLevel = document.getElementById('pain-level');
const confidence = document.getElementById('confidence');

// Initialize speech synthesis
const speechSynthesis = window.speechSynthesis;

// Function to speak the pain level
function speakPainLevel(painClass, painLevel) {
    const text = `This person has ${painClass} level of pain, with a pain score of ${painLevel} percent`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower speech rate
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
}

// Image Upload Handling
imageUpload.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            analyzeImageButton.disabled = false;
        };
        reader.readAsDataURL(file);
    }
});

// Analyze Uploaded Image
analyzeImageButton.addEventListener('click', async function() {
    if (!imagePreview.src) return;

    try {
        analyzeImageButton.innerHTML = '<span class="loading"></span> Analyzing...';
        analyzeImageButton.disabled = true;

        const response = await fetch('/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image: imagePreview.src })
        });

        if (response.ok) {
            const data = await response.json();
            updateResults(data);
            // Speak the pain level
            speakPainLevel(data.pain_class, data.pain_level);
        } else {
            const errorData = await response.json();
            showError(errorData.error || 'Error analyzing image');
        }
    } catch (error) {
        console.error('Error in analysis:', error);
        showError('Network error occurred');
    } finally {
        analyzeImageButton.innerHTML = 'Analyze Image';
        analyzeImageButton.disabled = false;
    }
});

// Update results display
function updateResults(data) {
    painLevel.textContent = `${data.pain_level}%`;
    confidence.textContent = `${data.confidence}%`;
    
    // Add visual feedback based on pain level
    const painLevelElement = document.getElementById('pain-level');
    if (data.pain_level > 70) {
        painLevelElement.style.color = '#e74c3c';
    } else if (data.pain_level > 30) {
        painLevelElement.style.color = '#f39c12';
    } else {
        painLevelElement.style.color = '#3498db';
    }

    // Update pain class if available
    if (data.pain_class) {
        const painClassElement = document.getElementById('pain-class');
        if (painClassElement) {
            painClassElement.textContent = data.pain_class;
        }
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    // Remove error message after 3 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Smooth scrolling for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}); 