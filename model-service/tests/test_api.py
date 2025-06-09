import os
import tempfile
from unittest.mock import patch, Mock
import pytest
from fastapi import status


class TestAPIEndpoints:
    """Test suite for FastAPI endpoints."""
    
    def test_health_endpoint(self, client):
        """Test the health check endpoint."""
        response = client.get("/health")
        assert response.status_code == status.HTTP_200_OK
        response_data = response.json()
        assert response_data["status"] == "healthy"
        assert "model_loaded" in response_data
        assert isinstance(response_data["model_loaded"], bool)
    
    def test_test_endpoint(self, client):
        """Test the test endpoint."""
        response = client.get("/test")
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == {"status": "healthy"}
    
    @patch('app.VIDEO_DIR', '/tmp/test_videos')
    @patch('os.listdir')
    def test_list_videos_success(self, mock_listdir, client):
        """Test listing videos when videos exist."""
        mock_listdir.return_value = ['video1.mp4', 'video2.mp4', 'not_video.txt']
        
        response = client.get("/videos")
        assert response.status_code == status.HTTP_200_OK
        
        videos = response.json()
        assert len(videos) == 2
        assert videos[0] == {"id": "video1", "file": "video1.mp4"}
        assert videos[1] == {"id": "video2", "file": "video2.mp4"}
    
    @patch('app.VIDEO_DIR', '/tmp/test_videos')
    @patch('os.listdir')
    def test_list_videos_empty(self, mock_listdir, client):
        """Test listing videos when no videos exist."""
        mock_listdir.return_value = ['text_file.txt', 'image.jpg']
        
        response = client.get("/videos")
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
    
    @patch('app.VIDEO_DIR')
    @patch('os.path.isfile')
    @patch('app.predict_video')
    def test_process_video_success(self, mock_predict, mock_isfile, mock_video_dir, client):
        """Test successful video processing."""
        mock_video_dir.__str__ = Mock(return_value='/tmp/test_videos')
        mock_isfile.return_value = True
        
        with patch('os.path.join', return_value='/tmp/test_videos/test123.mp4'):
            request_data = {
                "videoId": "test123",
                "cameraId": "cam_001",
                "location": "Main Street Intersection"
            }
            
            response = client.post("/run", json=request_data)
            assert response.status_code == status.HTTP_200_OK
    
    @patch('app.VIDEO_DIR')
    @patch('os.path.isfile')
    def test_process_video_not_found(self, mock_isfile, mock_video_dir, client):
        """Test video processing when video file doesn't exist."""
        mock_video_dir.__str__ = Mock(return_value='/tmp/test_videos')
        mock_isfile.return_value = False
        
        with patch('os.path.join', return_value='/tmp/test_videos/nonexistent.mp4'):
            request_data = {
                "videoId": "nonexistent",
                "cameraId": "cam_001",
                "location": "Main Street Intersection"
            }
            
            response = client.post("/run", json=request_data)
            assert response.status_code == status.HTTP_404_NOT_FOUND
            assert "Video file not found" in response.json()["detail"]
    
    def test_process_video_invalid_request(self, client):
        """Test video processing with invalid request data."""
        # Missing required fields
        request_data = {
            "videoId": "test123"
            # Missing cameraId and location
        }
        
        response = client.post("/run", json=request_data)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY 