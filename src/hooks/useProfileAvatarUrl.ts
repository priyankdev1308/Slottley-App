import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { supabase } from '../api/supabaseClient';

const PROFILE_IMAGE_BUCKET = 'profile_images';

// Refetches on every focus so a photo saved on Edit Profile shows up here
// as soon as the user navigates back, without needing a full remount.
export const useProfileAvatarUrl = () => {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) return;

        const { data } = await supabase
          .from('users')
          .select('profile_image')
          .eq('id', authData.user.id)
          .single();

        if (!cancelled) {
          setAvatarUrl(
            data?.profile_image
              ? supabase.storage.from(PROFILE_IMAGE_BUCKET).getPublicUrl(data.profile_image).data
                  .publicUrl
              : null,
          );
        }
      })();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  return avatarUrl;
};
