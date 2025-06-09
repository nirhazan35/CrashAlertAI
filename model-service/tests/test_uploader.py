import os
import tempfile
import subprocess
from unittest.mock import patch, Mock, MagicMock
import pytest
from datetime import date


class TestVideoTrimming:
    """Test suite for video trimming functionality."""
    
    @patch('uploader.subprocess.run')
    def test_trim_video_ffmpeg_success(self, mock_subprocess):
        """Test successful video trimming."""
        from uploader import trim_video_ffmpeg
        
        mock_subprocess.return_value = Mock(returncode=0)
        
        result = trim_video_ffmpeg(
            input_video="/fake/input.mp4",
            start_time=10.0,
            duration=15.0,
            output_video="/tmp/output.mp4"
        )
        
        # Verify subprocess was called
        mock_subprocess.assert_called_once()
        
        # Check command structure
        call_args = mock_subprocess.call_args[0][0]
        assert "ffmpeg" in call_args
        assert "/fake/input.mp4" in call_args
        assert "10.0" in call_args
        assert "15.0" in call_args
        assert "/tmp/output.mp4" in call_args
        
        assert result == "/tmp/output.mp4"
    
    @patch('uploader.subprocess.run')
    def test_trim_video_ffmpeg_failure(self, mock_subprocess):
        """Test video trimming failure."""
        from uploader import trim_video_ffmpeg
        
        # Mock subprocess failure
        mock_subprocess.side_effect = subprocess.CalledProcessError(1, 'ffmpeg')
        
        with pytest.raises(subprocess.CalledProcessError):
            trim_video_ffmpeg(
                input_video="/fake/input.mp4",
                start_time=10.0,
                duration=15.0,
                output_video="/tmp/output.mp4"
            )
    
    def test_trim_video_default_output(self):
        """Test video trimming with default output path."""
        from uploader import trim_video_ffmpeg
        
        with patch('uploader.subprocess.run') as mock_subprocess:
            mock_subprocess.return_value = Mock(returncode=0)
            
            result = trim_video_ffmpeg(
                input_video="/fake/input.mp4",
                start_time=5.0,
                duration=10.0
            )
            
            assert result == "/tmp/trimmed_video.mp4"


class TestGoogleDriveUpload:
    """Test suite for Google Drive upload functionality."""
    
    @patch('uploader.drive_service')
    @patch('uploader._get_or_create_today_folder')
    def test_upload_to_drive_success(self, mock_folder, mock_drive):
        """Test successful file upload to Google Drive."""
        from uploader import upload_to_drive
        
        # Mock folder creation
        mock_folder.return_value = "fake_folder_id"
        
        # Mock Drive service responses
        mock_files = Mock()
        mock_files.create.return_value.execute.return_value = {"id": "fake_file_id"}
        mock_permissions = Mock()
        mock_permissions.create.return_value.execute.return_value = {"id": "fake_perm_id"}
        
        mock_drive.files.return_value = mock_files
        mock_drive.permissions.return_value = mock_permissions
        
        # Mock logger
        mock_logger = Mock()
        
        # Create a temporary file for testing
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_file:
            tmp_file.write(b'fake video content')
            tmp_path = tmp_file.name
        
        try:
            result = upload_to_drive(mock_logger, tmp_path)
            
            # Verify the result
            expected_link = "https://drive.google.com/file/d/fake_file_id/view"
            assert result == expected_link
            
            # Verify Drive API calls
            mock_files.create.assert_called_once()
            mock_permissions.create.assert_called_once()
            
        finally:
            # Clean up
            os.unlink(tmp_path)
    
    @patch('uploader.drive_service')
    def test_get_or_create_today_folder_exists(self, mock_drive):
        """Test getting existing today folder."""
        from uploader import _get_or_create_today_folder
        
        # Mock existing folder response
        today = date.today().isoformat()
        mock_files = Mock()
        mock_files.list.return_value.execute.return_value = {
            "files": [{"id": "existing_folder_id"}]
        }
        mock_drive.files.return_value = mock_files
        
        result = _get_or_create_today_folder()
        
        assert result == "existing_folder_id"
        mock_files.list.assert_called_once()
    
    @patch('uploader.drive_service')
    def test_get_or_create_today_folder_create_new(self, mock_drive):
        """Test creating new today folder when it doesn't exist."""
        from uploader import _get_or_create_today_folder
        
        # Mock no existing folder and create new one
        mock_files = Mock()
        mock_files.list.return_value.execute.return_value = {"files": []}
        mock_files.create.return_value.execute.return_value = {"id": "new_folder_id"}
        mock_drive.files.return_value = mock_files
        
        result = _get_or_create_today_folder()
        
        assert result == "new_folder_id"
        mock_files.list.assert_called_once()
        mock_files.create.assert_called_once()
    
    @patch('uploader.drive_service')
    @patch('uploader._get_or_create_today_folder')
    def test_upload_to_drive_api_failure(self, mock_folder, mock_drive):
        """Test upload failure when Drive API fails."""
        from uploader import upload_to_drive
        
        mock_folder.return_value = "fake_folder_id"
        
        # Mock Drive API failure
        mock_files = Mock()
        mock_files.create.side_effect = Exception("API Error")
        mock_drive.files.return_value = mock_files
        
        mock_logger = Mock()
        
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as tmp_file:
            tmp_file.write(b'fake video content')
            tmp_path = tmp_file.name
        
        try:
            with pytest.raises(Exception):
                upload_to_drive(mock_logger, tmp_path)
        finally:
            os.unlink(tmp_path)


class TestUploaderConfiguration:
    """Test uploader configuration and initialization."""
    
    @patch('uploader.SERVICE_ACCOUNT_FILE', '/fake/credentials.json')
    @patch('uploader.service_account.Credentials.from_service_account_file')
    def test_credentials_loading(self, mock_creds):
        """Test Google service account credentials loading."""
        mock_creds.return_value = Mock()
        
        # Reimport to trigger credentials loading
        import importlib
        import uploader
        importlib.reload(uploader)
        
        mock_creds.assert_called()
    
    def test_configuration_constants(self):
        """Test that configuration constants are properly set."""
        import uploader
        
        assert hasattr(uploader, 'ROOT_FOLDER_ID')
        assert hasattr(uploader, 'SCOPES')
        assert "https://www.googleapis.com/auth/drive.file" in uploader.SCOPES 