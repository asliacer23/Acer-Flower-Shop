import { supabase } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  photo_url?: string;
  updated_at?: string;
}

export const profileService = {
  // Get user profile
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, photo_url, updated_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error('Failed to get profile:', error);
      return null;
    }
  },

  // Update user name via Auth User Metadata
  async updateUserName(userId: string, name: string): Promise<boolean> {
    try {
      // Update via auth user metadata
      const { data: { user }, error: authError } = await supabase.auth.updateUser({
        data: { full_name: name }
      });

      if (authError) {
        console.error('Error updating auth user:', authError);
        // Fallback to direct table update
        return await this.updateProfileNameDirect(userId, name);
      }

      console.log('Name updated successfully via auth:', user);

      // Also update profiles table for consistency
      try {
        const { error: tableError } = await supabase
          .from('profiles')
          .update({ name, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (tableError) {
          console.log('Note: Profiles table update had issue, but auth metadata succeeded:', tableError);
        }
      } catch (e) {
        console.log('Profiles table update non-critical:', e);
      }

      return true;
    } catch (error) {
      console.error('Failed to update name:', error);
      // Fallback to direct table update
      return await this.updateProfileNameDirect(userId, name);
    }
  },

  // Direct update to profiles table (fallback)
  async updateProfileNameDirect(userId: string, name: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .rpc('update_user_name', {
          user_id: userId,
          new_name: name
        });

      if (error) {
        console.error('Error in RPC:', error);
        return false;
      }

      console.log('Name updated via RPC');
      return true;
    } catch (error) {
      console.error('Failed RPC update:', error);
      return false;
    }
  },

  // Upload profile photo
  async uploadProfilePhoto(userId: string, file: File): Promise<string | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/profile-${Date.now()}.${fileExt}`;

      console.log('Starting photo upload:', fileName);

      // Upload to storage with upsert
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('profiles')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Error uploading photo:', uploadError);
        console.error('Upload error details:', uploadError.message);
        return null;
      }

      console.log('Photo uploaded:', uploadData);

      // Get public URL
      const { data } = supabase.storage
        .from('profiles')
        .getPublicUrl(fileName);

      const photoUrl = data.publicUrl;
      console.log('Public URL:', photoUrl);

      // Store URL in auth metadata (no RLS issues)
      const { error: authError } = await supabase.auth.updateUser({
        data: { photo_url: photoUrl }
      });

      if (authError) {
        console.error('Error updating auth metadata:', authError);
        // Still return URL even if metadata update fails
      }

      return photoUrl;
    } catch (error) {
      console.error('Failed to upload profile photo:', error);
      return null;
    }
  },

  // Delete profile photo
  async deleteProfilePhoto(userId: string, photoUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = photoUrl.split('/');
      const filePath = urlParts.slice(-2).join('/');

      console.log('Deleting photo path:', filePath);

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('profiles')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting photo:', deleteError);
        return false;
      }

      // Clear photo URL from auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { photo_url: null }
      });

      if (authError) {
        console.error('Error clearing auth metadata:', authError);
        // Still return true even if metadata update fails
      }

      console.log('Photo deleted successfully');
      return true;
    } catch (error) {
      console.error('Failed to delete profile photo:', error);
      return false;
    }
  },
};
