import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabase/client';
import { checkConsultantProfile, updateConsultantProfile } from '../profileManager';
import { toast } from 'sonner';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
        })),
        single: vi.fn(),
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('profileManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkConsultantProfile', () => {
    it('returns null if userId is undefined', async () => {
      const result = await checkConsultantProfile('');
      expect(result).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('User information is missing');
    });

    it('returns existing profile if found', async () => {
      const mockProfile = {
        id: '123',
        user_id: 'test-user',
        university: 'Test University',
      };

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
      }));

      const result = await checkConsultantProfile('test-user');
      expect(result).toEqual(mockProfile);
    });

    it('returns null and shows error toast if query fails', async () => {
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: new Error('Database error') }),
      }));

      const result = await checkConsultantProfile('test-user');
      expect(result).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('Error checking your profile status');
    });
  });

  describe('updateConsultantProfile', () => {
    it('updates existing profile without creating duplicates', async () => {
      // First, mock checking for existing profile
      const mockExistingProfile = {
        id: '123',
        user_id: 'test-user',
        university: 'Old University',
      };

      const mockUpdatedProfile = {
        ...mockExistingProfile,
        university: 'New University',
      };

      let queryCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockImplementation(() => {
          queryCount++;
          return Promise.resolve({ 
            data: queryCount === 1 ? mockExistingProfile : mockUpdatedProfile, 
            error: null 
          });
        }),
        update: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockUpdatedProfile, error: null }),
      }));

      // Update the profile
      const result = await updateConsultantProfile('test-user', {
        university: 'New University',
      });

      // Verify the update was successful
      expect(result).toEqual(mockUpdatedProfile);
      expect(supabase.from).toHaveBeenCalledWith('consultants');
      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully');
    });

    it('creates new profile if none exists', async () => {
      const mockNewProfile = {
        id: '123',
        user_id: 'test-user',
        university: 'New University',
      };

      // Mock profile check returning null
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      }));

      // Mock profile creation
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockNewProfile, error: null }),
      }));

      const result = await updateConsultantProfile('test-user', {
        university: 'New University',
      });

      expect(result).toEqual(mockNewProfile);
      expect(toast.success).toHaveBeenCalledWith('Profile created successfully');
    });

    it('handles errors during profile update', async () => {
      // Mock profile check succeeding
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ 
          data: { id: '123', user_id: 'test-user' }, 
          error: null 
        }),
      }));

      // Mock update failing
      vi.mocked(supabase.from).mockImplementationOnce(() => ({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('Update failed') }),
      }));

      const result = await updateConsultantProfile('test-user', {
        university: 'New University',
      });

      expect(result).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('Error updating profile');
    });
  });
}); 