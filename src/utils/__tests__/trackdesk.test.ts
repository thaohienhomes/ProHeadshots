/**
 * TrackDesk Integration Tests
 * 
 * Tests for TrackDesk affiliate tracking functionality
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock window and sessionStorage
const mockSessionStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

const mockWindow = {
  location: {
    href: 'https://coolpix.me?aff=test123&click_id=click456',
    search: '?aff=test123&click_id=click456'
  },
  document: {
    referrer: 'https://google.com',
    head: {
      appendChild: jest.fn()
    },
    body: {
      appendChild: jest.fn()
    },
    createElement: jest.fn(() => ({
      style: {},
      onload: null,
      onerror: null,
      src: ''
    }))
  },
  navigator: {
    sendBeacon: jest.fn()
  },
  sessionStorage: mockSessionStorage
};

// Mock the global window object
Object.defineProperty(global, 'window', {
  value: mockWindow,
  writable: true
});

Object.defineProperty(global, 'document', {
  value: mockWindow.document,
  writable: true
});

Object.defineProperty(global, 'sessionStorage', {
  value: mockSessionStorage,
  writable: true
});

// Import after mocking
import trackDeskTracker, { 
  initializeTrackDesk, 
  trackTrackDeskConversion, 
  getTrackDeskAffiliateInfo 
} from '../trackdesk';

describe('TrackDesk Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSessionStorage.getItem.mockReturnValue(null);
  });

  describe('Initialization', () => {
    it('should initialize TrackDesk tracking', () => {
      initializeTrackDesk();
      
      // Should create tracking script
      expect(mockWindow.document.createElement).toHaveBeenCalledWith('script');
    });

    it('should extract affiliate parameters from URL', () => {
      mockWindow.location.search = '?aff=test123&click_id=click456';
      
      initializeTrackDesk();
      
      // Should store affiliate ID and click ID
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('trackdesk_affiliate_id', 'test123');
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('trackdesk_click_id', 'click456');
    });
  });

  describe('Conversion Tracking', () => {
    it('should track sale conversion with affiliate attribution', () => {
      // Mock stored affiliate data
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'trackdesk_affiliate_id') return 'test123';
        if (key === 'trackdesk_click_id') return 'click456';
        return null;
      });

      const conversion = {
        conversionType: 'sale' as const,
        orderId: 'order_123',
        revenue: 29.99,
        currency: 'USD',
        customerId: 'user_456',
        customerEmail: 'test@example.com'
      };

      trackTrackDeskConversion(conversion);

      // Should create tracking pixel
      expect(mockWindow.document.createElement).toHaveBeenCalledWith('img');
    });

    it('should skip tracking when no affiliate ID is present', () => {
      mockSessionStorage.getItem.mockReturnValue(null);

      const conversion = {
        conversionType: 'sale' as const,
        orderId: 'order_123',
        revenue: 29.99
      };

      trackTrackDeskConversion(conversion);

      // Should not create tracking pixel when no affiliate
      expect(mockWindow.document.createElement).not.toHaveBeenCalledWith('img');
    });
  });

  describe('Affiliate Info Retrieval', () => {
    it('should return stored affiliate information', () => {
      mockSessionStorage.getItem.mockImplementation((key) => {
        if (key === 'trackdesk_affiliate_id') return 'test123';
        if (key === 'trackdesk_click_id') return 'click456';
        return null;
      });

      const affiliateInfo = getTrackDeskAffiliateInfo();

      expect(affiliateInfo).toEqual({
        affiliateId: 'test123',
        clickId: 'click456'
      });
    });

    it('should return null values when no affiliate data is stored', () => {
      mockSessionStorage.getItem.mockReturnValue(null);

      const affiliateInfo = getTrackDeskAffiliateInfo();

      expect(affiliateInfo).toEqual({
        affiliateId: null,
        clickId: null
      });
    });
  });
});

describe('Affiliate Tracking Integration', () => {
  it('should handle multiple conversion types correctly', () => {
    const conversionTypes = ['sale', 'freetrial', 'lead'] as const;
    
    conversionTypes.forEach(type => {
      const conversion = {
        conversionType: type,
        orderId: `order_${type}`,
        customerId: 'user_123'
      };

      expect(() => trackTrackDeskConversion(conversion)).not.toThrow();
    });
  });
});

export {};
