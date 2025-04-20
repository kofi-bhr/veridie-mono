import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabase/client';
import { updateConsultantProfile, checkConsultantProfile } from '../profileManager';
import { toast } from 'sonner';

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      maybeSingle: vi.fn(),
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
  const mockConsultant = {
    id: 'test-id',
    user_id: 'test-user-id',
    headline: 'Test Headline',
    university: 'Test University',
    major: ['Computer Science'],
    image_url: 'test-image.jpg',
    sat_score: 1500,
    num_aps: 5,
    is_active: true,
    stripe_account_id: null,
    stripe_charges_enabled: false,
    stripe_onboarding_complete: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkConsultantProfile', () => {
    it('returns null if no userId provided', async () => {
      const result = await checkConsultantProfile('');
      expect(result).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('User information is missing');
    });

    it('returns consultant data if found', async () => {
      const mockSelect = vi.fn().mockReturnThis();
      const mockEq = vi.fn().mockReturnThis();
      const mockMaybeSingle = vi.fn().mockResolvedValue({ data: mockConsultant, error: null });

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
      } as any);

      const result = await checkConsultantProfile('test-user-id');

      expect(supabase.from).toHaveBeenCalledWith('consultants');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(result).toEqual(mockConsultant);
    });

    it('handles database errors gracefully', async () => {
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: new Error('DB Error') }),
      } as any);

      const result = await checkConsultantProfile('test-user-id');

      expect(result).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('Error checking your profile status');
    });
  });

  describe('updateConsultantProfile', () => {
    const mockProfileData = {
      headline: 'Updated Headline',
      university: 'Updated University',
      major: ['Updated Major'],
    };

    it('updates existing profile successfully', async () => {
      // Mock checkConsultantProfile to return existing profile
      vi.mocked(supabase.from).mockImplementation((table) => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockConsultant, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockConsultant, error: null }),
      }) as any);

      const result = await updateConsultantProfile('test-user-id', mockProfileData);

      expect(result).toBeDefined();
      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully');
    });

    it('creates new profile if none exists', async () => {
      // Mock checkConsultantProfile to return null (no existing profile)
      const mockFrom = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: mockConsultant, error: null }),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      });

      vi.mocked(supabase.from).mockImplementation(mockFrom as any);

      const result = await updateConsultantProfile('test-user-id', mockProfileData);

      expect(result).toBeDefined();
      expect(toast.success).toHaveBeenCalledWith('Profile created successfully');
    });

    it('handles errors during profile update', async () => {
      // Mock database error
      vi.mocked(supabase.from).mockImplementation((table) => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockRejectedValue(new Error('Database error')),
        maybeSingle: vi.fn().mockResolvedValue({ data: mockConsultant, error: null }),
      }) as any);

      const result = await updateConsultantProfile('test-user-id', mockProfileData);

      expect(result).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('Error updating profile');
    });
  });
}); 