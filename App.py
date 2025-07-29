# streamlit_app.py

import streamlit as st
from ultralytics import YOLO
import cv2
import numpy as np
from matplotlib.patches import Rectangle
import matplotlib.pyplot as plt
from PIL import Image
from collections import Counter

# Load YOLOv8 model once
@st.cache_resource
def load_model():
    return YOLO(r'D:\Project\Oil-Palm-Tree-Detection\Oil-Palm-Tree-Detection\Model\yolov8m\weights\best.pt')

model = load_model()

# Class names and colors
class_names = ['Dead', 'Grass', 'Healthy', 'Small', 'Yellow']
class_colors = {
    'Dead': 'red',
    'Grass': 'lime',
    'Healthy': 'green',
    'Small': 'cyan',
    'Yellow': 'yellow'
}

# Title
st.title("🌲 Tree Health Detection - Upload Image")
st.write("Upload an image, and YOLOv8 will detect and classify the trees.")

# File uploader
uploaded_file = st.file_uploader("Choose an image...", type=["jpg", "jpeg", "png"])

if uploaded_file is not None:
    # Load image
    image = Image.open(uploaded_file).convert("RGB")
    img_np = np.array(image)

    # Save to temp path for YOLOv8
    image.save("temp.jpg")

    # Run YOLOv8 prediction
    results = model.predict("temp.jpg", verbose=False)
    boxes = results[0].boxes

    # Plot
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.imshow(img_np)
    ax.axis('off')
    ax.set_title("Detection Result")

    # Count classes
    class_count = Counter()

    if boxes is not None:
        for box, cls_id in zip(boxes.xyxy.cpu().numpy(), boxes.cls.cpu().numpy().astype(int)):
            x1, y1, x2, y2 = box
            class_name = class_names[cls_id]
            color = class_colors[class_name]
            rect = Rectangle((x1, y1), x2 - x1, y2 - y1,
                             linewidth=2, edgecolor=color, facecolor='none')
            ax.add_patch(rect)
            ax.text(x1, y1 - 5, class_name, color='white', fontsize=8,
                    bbox=dict(facecolor='black', alpha=0.5, pad=1))

            # Update count
            class_count[class_name] += 1

    # Display plot
    st.pyplot(fig)

    # Display class counts
    st.subheader("🧮 Class Counts")
    for cls_name in class_names:
        count = class_count.get(cls_name, 0)
        st.write(f"- **{cls_name}**: {count}")
    # Display total count
    st.write(f"**Total Trees Detected**: {sum(class_count.values())}")  