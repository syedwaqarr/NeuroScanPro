// document.addEventListener('DOMContentLoaded', function () {
//     // Init
//     document.querySelector('.image-section').style.display = 'none';
//     document.querySelector('.loader').style.display = 'none';
//     document.querySelector('#result').style.display = 'none';

//     function readURL(input) {
//         if (input.files && input.files[0]) {
//             var reader = new FileReader();
//             reader.onload = function (e) {
//                 document.querySelector('#imagePreview').src = e.target.result;
//             }
//             reader.readAsDataURL(input.files[0]);
//         }
//     }

//     document.querySelector('#imageUpload').addEventListener('change', function () {
//         document.querySelector('.image-section').style.display = 'block';
//         document.querySelector('#btn-predict').style.display = 'block';
//         var result = document.querySelector('#result');
//         result.textContent = '';
//         result.style.display = 'none';
//         readURL(this);
//     });

//     // Predict
//     document.querySelector('#btn-predict').addEventListener('click', function () {
//         var form = document.querySelector('#upload-file');
//         var formData = new FormData(form);

//         // Show loading animation
//         this.style.display = 'none';
//         document.querySelector('.loader').style.display = 'block';

//         // Make prediction by calling api /predict
//         fetch('/predict', {
//             method: 'POST',
//             body: formData
//         })
//         .then(response => response.text())
//         .then(data => {
//             // Get and display the result
//             document.querySelector('.loader').style.display = 'none';
//             var result = document.querySelector('#result');
//             result.style.display = 'block';
//             result.textContent = ' Result:  ' + data;
//             console.log('Success!');
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             document.querySelector('.loader').style.display = 'none';
//             document.querySelector('#btn-predict').style.display = 'block';
//         });
//     });
// });


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
