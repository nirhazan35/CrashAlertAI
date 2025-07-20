import React, { useState, useEffect, useRef } from 'react';
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
  Select,
} from '@mantine/core';
import { useAuth } from '../../authentication/AuthProvider';
import { fetchCameras } from '../AdminPage/AdminActions';
import '../authFormCSS/AuthForm.css';
import '../ManageCameras/ManageCameras.css';

const RunInference = () => {
  const { user } = useAuth();
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [withBbox, setWithBbox] = useState(false);
  const videoGridRef = useRef(null);
  const runButtonRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const fetchAllCameras = async () => {
      if (!user?.token) return;
      try {
        const data = await fetchCameras(user);
        let cameraArr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        setCameras(cameraArr);
      } catch (err) {
        setCameras([]);
      }
    };
    if (user?.token) {
      fetchAllCameras();
    }
  }, [user?.token]);

  // Fetch videos only after camera is selected
  useEffect(() => {
    if (!selectedCamera) return;
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
        const vids = data.data || [];
        setVideos(vids);
        // Only scroll if there are videos
        if (vids.length > 0 && videoGridRef.current) {
          setTimeout(() => {
            videoGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      } catch (err) {
        setError('No videos found.');
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [selectedCamera, user?.token]);

  const handleRunInference = async (e) => {
    e.preventDefault();
    if (!selectedVideo || !selectedCamera) return;
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
            cameraId: selectedCamera,
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
            {selectedCamera
              ? 'Select a video and run inference.'
              : 'Select a camera to run inference on.'}
          </div>
          {status && <div ref={statusRef} className="auth-message auth-message-success">{status}</div>}
          {error && <div ref={statusRef} className="auth-message auth-message-error">{error}</div>}
          {/* Step 1: Camera selection grid */}
          <div
            className="camera-selection-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.25rem',
              margin: '2rem 0',
            }}
          >
            {cameras.map((camera) => (
              <div
                key={camera._id || camera.cameraId}
                className={`camera-item${selectedCamera === camera.cameraId ? ' selected' : ''}`}
                onClick={() => {
                  setSelectedCamera(camera.cameraId);
                  setSelectedVideo(null);
                  setStatus('');
                  setError('');
                  // Remove scroll logic from here
                }}
                tabIndex={0}
                aria-label={`Select camera ${camera.name || camera.cameraId}`}
                style={{
                  border: selectedCamera === camera.cameraId ? '2px solid #3182ce' : undefined,
                  boxShadow: selectedCamera === camera.cameraId ? '0 0 0 2px #3182ce33' : undefined,
                  cursor: 'pointer',
                }}
              >
                {/* <div className="camera-id">Camera ID: {camera.cameraId}</div> */}
                <div className="camera-name">{camera.name || camera.cameraId}</div>
                {camera.location && (
                  <div style={{ color: '#888', fontSize: 13, marginTop: 4 }}>Location: {camera.location}</div>
                )}
              </div>
            ))}
          </div>
          {/* Step 2: Video selection and inference, only if camera is selected */}
          {selectedCamera && (
            <div ref={videoGridRef}>
              <form onSubmit={handleRunInference}>
                <Center mb="md">
                  <Switch
                    style={{ top: 20 }}
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
                      onClick={() => {
                        setSelectedVideo(video);
                        setTimeout(() => {
                          if (runButtonRef.current) {
                            runButtonRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }, 100);
                      }}
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
                    ref={runButtonRef}
                    type="submit"
                    size="lg"
                    disabled={!selectedVideo}
                    style={{ width: 400 }}
                    onClick={() => {
                      if (statusRef.current) {
                        statusRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                  >
                    Run Inference
                  </Button>
                </Center>
              </form>
            </div>
          )}
        </div>
      </Container>
    </Box>
  );
};

export default RunInference;