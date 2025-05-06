import { useState, useEffect } from 'react';
import { useAuth } from '../authentication/AuthProvider';

export function useCameraData() {
  const [cameraData, setCameraData] = useState({
    cameras: [],
    locations: [],
  });
  const { user } = useAuth();
  useEffect(() => {
    let isMounted = true;

    async function fetchCameraData() {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_URL_BACKEND}/cameras/get-id_location`,
          {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user?.token}`,
            },
          }
        );
        const data = await res.json();
        if (!isMounted) return;

        if (res.ok) {
          setCameraData({
            cameras: data.map((i) => i.cameraId) || [],
            locations: data.map((i) => i.location) || [],
          });
        } else {
          console.error('Error fetching camera data:', data);
          throw new Error('Non-OK response');
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching camera data:', err);
        // fallback/mock data
        setCameraData({
          cameras: ['Camera 1', 'Camera 2', 'Camera 3', 'Camera 4'],
          locations: [
            'Parking Lot A',
            'Main Road',
            'Highway Junction',
            'Campus Entrance',
          ],
        });
      }
    }

    fetchCameraData();
    return () => {
      isMounted = false;
    };
  }, []);

  return cameraData; // { cameras: [...], locations: [...] }
}
