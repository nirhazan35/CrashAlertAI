const ipProcessor = require('../../src/middleware/ipProcessor');

describe('IP Processor Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      ip: undefined,
      headers: {},
      connection: {},
      socket: {}
    };
    res = {};
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should use req.ip when available', () => {
    req.ip = '192.168.1.100';
    
    ipProcessor(req, res, next);
    
    expect(req.ip).toBe('192.168.1.100');
    expect(next).toHaveBeenCalled();
  });

  it('should convert IPv4-mapped IPv6 to IPv4', () => {
    req.ip = '::ffff:192.168.1.100';
    
    ipProcessor(req, res, next);
    
    expect(req.ip).toBe('192.168.1.100');
    expect(next).toHaveBeenCalled();
  });

  it('should convert IPv6 loopback to IPv4 loopback', () => {
    req.ip = '::1';
    
    ipProcessor(req, res, next);
    
    expect(req.ip).toBe('127.0.0.1');
    expect(next).toHaveBeenCalled();
  });

  it('should handle comma-separated IPs from x-forwarded-for', () => {
    req.ip = undefined;
    req.headers['x-forwarded-for'] = '203.0.113.1, 198.51.100.1, 192.168.1.1';
    
    ipProcessor(req, res, next);
    
    expect(req.ip).toBe('203.0.113.1');
    expect(next).toHaveBeenCalled();
  });

  it('should handle x-forwarded-for with IPv4-mapped IPv6', () => {
    req.ip = undefined;
    req.headers['x-forwarded-for'] = '::ffff:203.0.113.1, ::ffff:198.51.100.1';
    
    ipProcessor(req, res, next);
    
    expect(req.ip).toBe('203.0.113.1');
    expect(next).toHaveBeenCalled();
  });

  it('should use x-real-ip header when available', () => {
    req.ip = undefined;
    req.headers['x-real-ip'] = '203.0.113.1';
    
    ipProcessor(req, res, next);
    
    expect(req.ip).toBe('203.0.113.1');
    expect(next).toHaveBeenCalled();
  });

  it('should use connection.remoteAddress when headers are not available', () => {
    req.ip = undefined;
    req.connection.remoteAddress = '192.168.1.100';
    
    ipProcessor(req, res, next);
    
    expect(req.ip).toBe('192.168.1.100');
    expect(next).toHaveBeenCalled();
  });

  it('should use socket.remoteAddress when connection.remoteAddress is not available', () => {
    req.ip = undefined;
    req.socket.remoteAddress = '192.168.1.100';
    
    ipProcessor(req, res, next);
    
    expect(req.ip).toBe('192.168.1.100');
    expect(next).toHaveBeenCalled();
  });

  it('should default to "Unknown" when no IP is found', () => {
    req.ip = undefined;
    
    ipProcessor(req, res, next);
    
    expect(req.ip).toBe('Unknown');
    expect(next).toHaveBeenCalled();
  });

  it('should handle whitespace in comma-separated IPs', () => {
    req.ip = undefined;
    req.headers['x-forwarded-for'] = ' 203.0.113.1 , 198.51.100.1 ';
    
    ipProcessor(req, res, next);
    
    expect(req.ip).toBe('203.0.113.1');
    expect(next).toHaveBeenCalled();
  });

  it('should not modify already clean IPv4 addresses', () => {
    req.ip = '203.0.113.1';
    
    ipProcessor(req, res, next);
    
    expect(req.ip).toBe('203.0.113.1');
    expect(next).toHaveBeenCalled();
  });

  it('should handle edge case with empty string IP', () => {
    req.ip = '';
    
    ipProcessor(req, res, next);
    
    expect(req.ip).toBe('Unknown');
    expect(next).toHaveBeenCalled();
  });

  it('should handle null IP value', () => {
    req.ip = null;
    req.headers['x-forwarded-for'] = '192.168.1.100';
    
    ipProcessor(req, res, next);
    
    expect(req.ip).toBe('192.168.1.100');
    expect(next).toHaveBeenCalled();
  });
}); 