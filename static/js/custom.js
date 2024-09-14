
console.log("JS file is linked successfully");

const dropArea = document.getElementById('drop-area');
const inputFile = document.getElementById('input-file');
const imageView = document.getElementById('image-view');
const predictBtn = document.getElementById('predict-btn');
const resultDiv = document.getElementById('result');


inputFile.addEventListener('change', uploadImage);

function uploadImage() {
    if (inputFile.files && inputFile.files[0]) {
        let imgLink = URL.createObjectURL(inputFile.files[0]);
        imageView.style.backgroundImage = `url(${imgLink})`;
        imageView.textContent = "";
        imageView.style.border = 0;

        // Clear previous prediction result
        resultDiv.textContent = '';
        resultDiv.style.display = 'none';
        predictBtn.textContent = 'Predict'; // Reset button text
    }
}

dropArea.addEventListener("dragover", function(e) {
    e.preventDefault();
});

dropArea.addEventListener("drop", function(e) {
    e.preventDefault();
    inputFile.files = e.dataTransfer.files;
    uploadImage();
});

predictBtn.addEventListener('click', function() {
    console.log('clicked predict btn');

    if (inputFile.files.length === 0) {
        alert('Please upload an image first.');
        return;
    }

    const formData = new FormData();
    formData.append('file', inputFile.files[0]);


    fetch('/predict', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text()) // Assuming the server responds with JSON
    .then(data => {
        console.log('Prediction Result:', data);
        resultDiv.textContent = `Prediction: ${data}`; // Adjust based on the server's response
        resultDiv.style.display = 'block';
        predictBtn.textContent = 'Predict'; // Reset button text
        
    })
    .catch(error => {
        console.error('Error:', error);
        resultDiv.textContent = 'An error occurred while predicting.';
        resultDiv.style.display = 'block';
        predictBtn.textContent = 'Predict'; // Reset button text
    });
});
