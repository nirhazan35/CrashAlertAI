import React, { useState, useEffect } from 'react';
import { Box, Container, Title, Button, Image, Loader } from '@mantine/core';
import { useAuth } from '../../authentication/AuthProvider';
import '../authFormCSS/AuthForm.css';

const RunInference = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/get-videos`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) throw new Error('Failed to fetch videos');
        const data = await response.json();
        setVideos(data.data || []); // Use data.data as per backend
      } catch (err) {
        setError('No Videos found.');
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchVideos();
  }, [user]);

  const handleRunInference = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');
    if (!selectedVideo) return;
    if (!selectedVideo.cameraId) {
      setError('Selected video is missing cameraId.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_URL_BACKEND}/accidents/run-inference`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: selectedVideo.id,
          cameraId: selectedVideo.cameraId,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to run inference');
      setStatus('Inference started! The accident will appear if detected.');
    } catch (err) {
      setError(err.message || 'Failed to run inference');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-page">
      <Container size="xs">
        <div className="auth-container">
          <Title order={2} style={{ textAlign: 'center' }}>Run Inference</Title>
          <div className="auth-subtitle">
            Select a video stored on the server and run the model inference.
          </div>

          {status && (
            <div className="auth-message auth-message-success">{status}</div>
          )}
          {error && (
            <div className="auth-message auth-message-error">{error}</div>
          )}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
              <Loader size="lg" />
            </div>
          ) : (
            <form onSubmit={handleRunInference}>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '1.5rem',
                  justifyItems: 'center',
                }}>
                  {videos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      style={{
                        cursor: 'pointer',
                        border: selectedVideo?.id === video.id ? '2px solid #3182ce' : '2px solid transparent',
                        borderRadius: 10,
                        boxShadow: selectedVideo?.id === video.id ? '0 0 0 2px #3182ce33' : '0 2px 8px rgba(0,0,0,0.06)',
                        padding: 8,
                        background: '#fff',
                        transition: 'border 0.2s, box-shadow 0.2s',
                        width: 170,
                        textAlign: 'center',
                      }}
                      tabIndex={0}
                      aria-label={`Select ${video.name || video.file}`}
                    >
                      <Image
                        src={video.thumbnailUrl}
                        alt={video.name || video.file}
                        width={160}
                        height={90}
                        radius="md"
                        withPlaceholder
                        style={{ marginBottom: 8 }}
                      />
                      <div style={{ fontWeight: 500 }}>{video.name || video.file}</div>
                      {(!video.cameraId) && (
                        <div style={{ color: 'red', fontSize: 12, marginTop: 4 }}>
                          Missing cameraId
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <Button
                type="submit"
                fullWidth
                size="lg"
                disabled={!selectedVideo || !selectedVideo.cameraId}
                style={{ marginTop: '1.5rem' }}
              >
                Run Inference
              </Button>
            </form>
          )}
        </div>
      </Container>
    </Box>
  );
};

export default RunInference; 