import { useState, useEffect } from 'react';
import { Edit2, Upload, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { profileService } from '@/services/profiles';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName: string;
  userPhoto?: string;
  userId: string;
  onProfileUpdated: (name: string, photo: string | undefined) => void;
}

export function EditProfileModal({
  open,
  onOpenChange,
  userName,
  userPhoto,
  userId,
  onProfileUpdated,
}: EditProfileModalProps) {
  const { toast } = useToast();
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(userName);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [photo, setPhoto] = useState<string | undefined>(userPhoto);

  // Update state when props change
  useEffect(() => {
    setName(userName);
    setPhoto(userPhoto);
  }, [userName, userPhoto, open]);

  const handleNameChange = async () => {
    if (!name.trim()) {
      toast({
        title: 'Error',
        description: 'Name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    if (name === userName) {
      toast({
        title: 'No changes',
        description: 'You haven\'t changed your name',
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Updating name to:', name);
      const success = await profileService.updateUserName(userId, name);
      if (success) {
        // Update auth context immediately
        if (updateUser) {
          await updateUser({ name });
        }
        
        toast({
          title: 'Success ✓',
          description: 'Your name has been updated',
        });
        onProfileUpdated(name, photo);
        onOpenChange(false);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update name. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Name update error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while updating your name',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Error',
        description: 'File size must be less than 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Error',
        description: 'File must be an image (JPG, PNG, etc.)',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      console.log('Starting photo upload:', file.name, file.size);
      const photoUrl = await profileService.uploadProfilePhoto(userId, file);
      
      if (photoUrl) {
        setPhoto(photoUrl);
        
        // Update auth context
        if (updateUser) {
          await updateUser({ photo_url: photoUrl });
        }
        
        toast({
          title: 'Success ✓',
          description: 'Photo uploaded successfully',
        });
        onProfileUpdated(name, photoUrl);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to upload photo. Check browser console for details.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while uploading the photo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!photo) return;

    setUploading(true);
    try {
      const success = await profileService.deleteProfilePhoto(userId, photo);
      if (success) {
        setPhoto(undefined);
        
        // Update auth context
        if (updateUser) {
          await updateUser({ photo_url: null });
        }
        
        toast({
          title: 'Success ✓',
          description: 'Photo removed successfully',
        });
        onProfileUpdated(name, undefined);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to remove photo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your profile information</DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Photo Section */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Profile Photo</Label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {photo ? (
                  <img src={photo} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl">📷</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={uploading}
                  onClick={() => document.getElementById('photo-input')?.click()}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-1" />
                      Upload Photo
                    </>
                  )}
                </Button>
                {photo && (
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={uploading}
                    onClick={handleRemovePhoto}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                )}
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />
                <p className="text-xs text-muted-foreground">Max 5MB, JPG/PNG</p>
              </div>
            </div>
          </div>

          {/* Name Section */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-base font-semibold">
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={loading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading || uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNameChange}
              disabled={loading || uploading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
