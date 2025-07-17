import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Title,
  Button,
  Image,
  Loader,
  Switch,
  SimpleGrid,
  Center,
} from '@mantine/core';
import { useAuth } from '../../authentication/AuthProvider';
import '../authFormCSS/AuthForm.css';

const RunInference = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [withBbox, setWithBbox] = useState(false);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(
          `${process.env.REACT_APP_URL_BACKEND}/accidents/get-videos`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${user?.token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch videos');
        const data = await response.json();
        setVideos(data.data || []);
      } catch (err) {
        setError('No videos found.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) fetchVideos();
  }, [user?.token]);

  const handleRunInference = async (e) => {
    e.preventDefault();
    if (!selectedVideo) return;

    setStatus('');
    setError('');
    setLoading(true);

    try {
      const endpoint = withBbox
        ? '/accidents/run-inference-bbox'
        : '/accidents/run-inference';

      const response = await fetch(
        `${process.env.REACT_APP_URL_BACKEND}${endpoint}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            videoId: selectedVideo.id,
            cameraId: 'CAM_TelAviv_SouthEntry',
          }),
        }
      );

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
      <Container size="xl" px="md">
        <div className="auth-container" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Title order={2} ta="center">
            Run Inference
          </Title>
          <div className="auth-subtitle" style={{ maxWidth: 1200, margin: '0 auto', padding: '1 auto' }}>
            Select a video stored on the server and run the model inference.
          </div>

          {status && <div className="auth-message auth-message-success">{status}</div>}
          {error && <div className="auth-message auth-message-error">{error}</div>}

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
              <Loader size="lg" />
            </div>
          ) : (
            <form onSubmit={handleRunInference}>
              <Center mb="md">
                <Switch
                  style={{top: 20}}
                  size="md"
                  color="blue"
                  checked={withBbox}
                  onChange={(e) => setWithBbox(e.currentTarget.checked)}
                  label="Show bounding boxes (slower)"
                  labelPosition="right"
                />
              </Center>

              <SimpleGrid
                cols={4}
                spacing="lg"
                mb="xl"
                breakpoints={[
                  { maxWidth: '62rem', cols: 3 },
                  { maxWidth: '48rem', cols: 2 },
                  { maxWidth: '36rem', cols: 1 },
                ]}
              >
                {videos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    tabIndex={0}
                    aria-label={`Select ${video.name || video.file}`}
                    style={{
                      cursor: 'pointer',
                      border:
                        selectedVideo?.id === video.id
                          ? '2px solid #3182ce'
                          : '2px solid transparent',
                      borderRadius: 12,
                      boxShadow:
                        selectedVideo?.id === video.id
                          ? '0 0 0 2px #3182ce33'
                          : '0 3px 12px rgba(0,0,0,0.08)',
                      padding: 10,
                      background: '#fff',
                      transition: 'border 0.2s, box-shadow 0.2s',
                    }}
                  >
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.name || video.file}
                      withPlaceholder
                      radius="md"
                      style={{
                        width: '100%',
                        aspectRatio: '16 / 9',
                        marginBottom: 8,
                        objectFit: 'cover',
                      }}
                    />
                    <div style={{ fontWeight: 500, textAlign: 'center' }}>
                      {video.name || video.file}
                    </div>
                  </div>
                ))}
              </SimpleGrid>

              <Center mt="md">
                <Button
                  type="submit"
                  size="lg"
                  disabled={!selectedVideo}
                  style={{ width: 400 }}
                >
                  Run Inference
                </Button>
              </Center>
            </form>
          )}
        </div>
      </Container>
    </Box>
  );
};

export default RunInference;