import { calculateCoreStatistics, calculateTimeBasedTrends, calculateFalsePositiveTrends } from '../../src/services/statisticsService';

// Mock fetch for API tests
global.fetch = jest.fn();

describe('Statistics Service', () => {
  // Mock accident data for consistent testing
  const mockAccidents = [
    {
      id: '1',
      date: '2023-01-15T10:30:00.000Z',
      severity: 'high',
      location: 'Main Street',
      cameraId: 'cam1',
      falsePositive: false,
      assignedTo: 'user1'
    },
    {
      id: '2',
      date: '2023-01-20T15:45:00.000Z',
      severity: 'medium',
      location: 'Main Street',
      cameraId: 'cam1',
      falsePositive: true,
      assignedTo: 'user2'
    },
    {
      id: '3',
      date: '2023-02-05T08:15:00.000Z',
      severity: 'low',
      location: 'Oak Avenue',
      cameraId: 'cam2',
      falsePositive: false,
      assignedTo: 'user1'
    },
    {
      id: '4',
      date: '2023-02-10T12:00:00.000Z',
      severity: 'high',
      location: 'Pine Road',
      cameraId: 'cam3',
      falsePositive: true,
      assignedTo: 'user3'
    },
    {
      id: '5',
      date: '2023-02-15T17:20:00.000Z',
      severity: 'medium',
      location: 'Elm Street',
      cameraId: 'cam4',
      falsePositive: false,
      assignedTo: 'user2'
    }
  ];

  describe('calculateCoreStatistics', () => {
    test('correctly calculates total accidents', () => {
      const stats = calculateCoreStatistics(mockAccidents);
      expect(stats.totalHandled).toBe(5);
    });

    test('correctly calculates severity distribution', () => {
      const stats = calculateCoreStatistics(mockAccidents);
      expect(stats.severityDistribution.high.count).toBe(2);
      expect(stats.severityDistribution.medium.count).toBe(2);
      expect(stats.severityDistribution.low.count).toBe(1);
      expect(parseFloat(stats.severityDistribution.high.percentage)).toBeCloseTo(40.0);
      expect(parseFloat(stats.severityDistribution.medium.percentage)).toBeCloseTo(40.0);
      expect(parseFloat(stats.severityDistribution.low.percentage)).toBeCloseTo(20.0);
    });

    test('correctly calculates false positive rate', () => {
      const stats = calculateCoreStatistics(mockAccidents);
      expect(parseFloat(stats.falsePositiveRate)).toBeCloseTo(40.0);
    });

    test('correctly identifies top locations', () => {
      const stats = calculateCoreStatistics(mockAccidents);
      expect(stats.top5Locations[0].location).toBe('Main Street');
      expect(stats.top5Locations[0].count).toBe(2);
    });

    test('correctly identifies most active responders', () => {
      const stats = calculateCoreStatistics(mockAccidents);
      const user1 = stats.mostActiveResponders.find(r => r.responder === 'user1');
      expect(user1.count).toBe(2);
    });
  });

  describe('calculateTimeBasedTrends', () => {
    test('correctly calculates monthly trends', () => {
      const trends = calculateTimeBasedTrends(mockAccidents);
      expect(trends.monthlyTrends).toHaveLength(2); // Jan and Feb
      expect(trends.monthlyTrends[0].date).toBe('2023-01');
      expect(trends.monthlyTrends[0].count).toBe(2);
      expect(trends.monthlyTrends[1].date).toBe('2023-02');
      expect(trends.monthlyTrends[1].count).toBe(3);
    });

    test('correctly calculates hourly trends', () => {
      const trends = calculateTimeBasedTrends(mockAccidents);
      expect(trends.hourlyTrends.some(h => h.hour === 10)).toBeTruthy();
      expect(trends.hourlyTrends.some(h => h.hour === 15)).toBeTruthy();
    });
  });

  describe('calculateFalsePositiveTrends', () => {
    test('correctly calculates false positives by location', () => {
      const trends = calculateFalsePositiveTrends(mockAccidents);
      expect(trends.byLocation).toHaveLength(2);
      const mainStreet = trends.byLocation.find(loc => loc.location === 'Main Street');
      const pineRoad = trends.byLocation.find(loc => loc.location === 'Pine Road');
      expect(mainStreet.count).toBe(1);
      expect(pineRoad.count).toBe(1);
    });

    test('correctly calculates false positives by camera ID', () => {
      const trends = calculateFalsePositiveTrends(mockAccidents);
      expect(trends.byCameraId).toHaveLength(2);
      const cam1 = trends.byCameraId.find(cam => cam.cameraId === 'cam1');
      const cam3 = trends.byCameraId.find(cam => cam.cameraId === 'cam3');
      expect(cam1.count).toBe(1);
      expect(cam3.count).toBe(1);
    });
  });
}); 