# Dockerfile for Rayyan ML Training and Experimentation
# Includes Jupyter, PyTorch/TensorFlow, and common ML libraries

FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    build-essential \
    git \
    libgomp1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    curl && \
    rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /workspace

# Copy requirements if they exist, otherwise install common ML packages
COPY requirements.txt* ./

# Install common ML dependencies
RUN pip install --no-cache-dir \
    jupyter \
    jupyterlab \
    numpy \
    pandas \
    matplotlib \
    seaborn \
    scikit-learn \
    torch \
    tensorflow \
    onnx \
    onnxruntime \
    tf2onnx \
    pillow \
    opencv-python-headless \
    pyyaml \
    tqdm \
    plotly \
    && pip install --no-cache-dir -r requirements.txt 2>/dev/null || true

# Copy ML modules
COPY . .

# Create non-root user for security
RUN useradd -m -u 1000 mluser && \
    chown -R mluser:mluser /workspace

USER mluser

# Expose Jupyter port
EXPOSE 8888

# Health check
HEALTHCHECK --interval=60s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8888/api || exit 1

# Run JupyterLab by default
CMD ["jupyter", "lab", "--ip=0.0.0.0", "--port=8888", "--no-browser", "--allow-root"]
