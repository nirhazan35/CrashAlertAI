import os
import sys
import tempfile
import shutil
from unittest.mock import Mock, patch
import pytest
from fastapi.testclient import TestClient

# Add the parent directory to sys.path so we can import our app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    # Mock the model loading to avoid loading actual YOLO model in tests
    with patch('app.YOLO') as mock_yolo:
        mock_model = Mock()
        mock_yolo.return_value = mock_model
        
        from app import app
        return TestClient(app)

@pytest.fixture
def temp_video_dir():
    """Create a temporary directory for test videos."""
    temp_dir = tempfile.mkdtemp()
    yield temp_dir
    shutil.rmtree(temp_dir)

@pytest.fixture
def sample_video_file(temp_video_dir):
    """Create a sample video file for testing."""
    video_path = os.path.join(temp_video_dir, "test_video.mp4")
    # Create a dummy file (not a real video, but enough for basic file operations)
    with open(video_path, 'wb') as f:
        f.write(b'fake video content')
    return video_path

@pytest.fixture
def mock_environment():
    """Mock environment variables for testing."""
    env_vars = {
        'YOLO_WEIGHTS': '/app/weights/best.pt',
        'VIDEO_DIR': '/tmp/test_videos',
        'INTERNAL_BACKEND_URL': 'http://test-backend/api/accidents',
        'INTERNAL_SECRET': 'test-secret',
        'SERVICE_ACCOUNT_FILE': '/tmp/fake_credentials.json'
    }
    
    with patch.dict(os.environ, env_vars):
        yield env_vars 