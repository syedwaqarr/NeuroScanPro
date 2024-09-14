import os
import numpy as np
from PIL import Image
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from flask import Flask, request, render_template
from werkzeug.utils import secure_filename
import torch.nn.functional as F


# Define the Flask app
app = Flask(__name__)


# Define the model class
class CNN_TUMOR(nn.Module):
    def __init__(self, params):
        super(CNN_TUMOR, self).__init__()
        Cin, Hin, Win = params["shape_in"]
        init_f = params["initial_filters"]
        num_fc1 = params["num_fc1"]
        num_classes = params["num_classes"]
        self.dropout_rate = params["dropout_rate"]

        self.conv1 = nn.Conv2d(Cin, init_f, kernel_size=3)
        h, w = findConv2dOutShape(Hin, Win, self.conv1)
        self.conv2 = nn.Conv2d(init_f, 2*init_f, kernel_size=3)
        h, w = findConv2dOutShape(h, w, self.conv2)
        self.conv3 = nn.Conv2d(2*init_f, 4*init_f, kernel_size=3)
        h, w = findConv2dOutShape(h, w, self.conv3)
        self.conv4 = nn.Conv2d(4*init_f, 8*init_f, kernel_size=3)
        h, w = findConv2dOutShape(h, w, self.conv4)

        self.num_flatten = h * w * 8 * init_f
        self.fc1 = nn.Linear(self.num_flatten, num_fc1)
        self.fc2 = nn.Linear(num_fc1, num_classes)

    def forward(self, X):
        X = F.relu(self.conv1(X))
        X = F.max_pool2d(X, 2, 2)
        X = F.relu(self.conv2(X))
        X = F.max_pool2d(X, 2, 2)
        X = F.relu(self.conv3(X))
        X = F.max_pool2d(X, 2, 2)
        X = F.relu(self.conv4(X))
        X = F.max_pool2d(X, 2, 2)
        X = X.view(-1, self.num_flatten)
        X = F.relu(self.fc1(X))
        X = F.dropout(X, self.dropout_rate)
        X = self.fc2(X)
        return F.log_softmax(X, dim=1)

def findConv2dOutShape(hin, win, conv, pool=2):
    kernel_size = conv.kernel_size
    stride = conv.stride
    padding = conv.padding
    dilation = conv.dilation

    hout = np.floor((hin + 2 * padding[0] - dilation[0] * (kernel_size[0] - 1) - 1) / stride[0] + 1)
    wout = np.floor((win + 2 * padding[1] - dilation[1] * (kernel_size[1] - 1) - 1) / stride[1] + 1)

    if pool:
        hout /= pool
        wout /= pool
    return int(hout), int(wout)

params_model = {
    "shape_in": (3, 256, 256),
    "initial_filters": 8,
    "num_fc1": 100,
    "dropout_rate": 0.25,
    "num_classes": 2
}

# Load the model
model = CNN_TUMOR(params_model)
model.load_state_dict(torch.load('model.pth', map_location=torch.device('cpu')))
model.eval()  # Set the model to evaluation mode

# Define transformations for the image
transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Define a function for image prediction
def predict_image(image_path):
    image = Image.open(image_path).convert('RGB')
    image = transform(image)
    image = image.unsqueeze(0)
    image = image.to(torch.device('cuda' if torch.cuda.is_available() else 'cpu'))
    
    with torch.no_grad():
        output = model(image)
        _, predicted = torch.max(output, 1)
    
    CLA_label = {0: 'Brain Tumor', 1: 'Healthy'}
    return CLA_label[predicted.item()]


################################### Flask routes ##########################################
@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/about', methods=["GET"])
def about():
    return render_template('about.html')

@app.route('/predict', methods=["GET"])
def predict():
    return render_template('predict.html')

@app.route('/predict', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return 'No file part'
    
    file = request.files['file']
    if file.filename == '':
        return 'No selected file'
    
    if file:
        basepath = os.path.dirname(__file__)
        uploads_dir = os.path.join(basepath, 'uploads')
        os.makedirs(uploads_dir, exist_ok=True)  # Ensure the uploads directory exists
        file_path = os.path.join(uploads_dir, secure_filename(file.filename))
        file.save(file_path)
        
        result = predict_image(file_path)
        return result

    return 'File not uploaded'

if __name__ == '__main__':
    app.run(debug=True)
