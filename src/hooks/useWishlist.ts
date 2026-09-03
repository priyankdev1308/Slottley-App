import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { supabase } from '../api/supabaseClient';
import { addToWishlist, fetchWishlistPlaceIds, removeFromWishlist } from '../api/wishlist';

// Shared by Home, the "View All" list, and Place Detail so the heart icon
// reflects the same liked state everywhere — each screen re-fetches its own
// copy on focus (same convention as useProfileAvatarUrl) rather than reading
// from a global store.
export const useWishlist = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        const { data } = await supabase.auth.getUser();
        const uid = data.user?.id ?? null;
        if (cancelled) return;
        setUserId(uid);

        if (!uid) {
          setLikedIds(new Set());
          return;
        }
        const ids = await fetchWishlistPlaceIds(uid);
        if (!cancelled) setLikedIds(new Set(ids));
      })();

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const isLiked = useCallback((placeId: string) => likedIds.has(placeId), [likedIds]);

  const toggleLike = useCallback(
    async (placeId: string) => {
      // A screen can mount and the heart can be tapped before the focus
      // effect above finishes resolving the user — fall back to resolving
      // it here instead of silently no-op-ing on that first fast tap.
      let uid = userId;
      if (!uid) {
        const { data } = await supabase.auth.getUser();
        uid = data.user?.id ?? null;
        setUserId(uid);
      }
      if (!uid) return;
      const resolvedUid = uid;

      const wasLiked = likedIds.has(placeId);

      setLikedIds(prev => {
        const next = new Set(prev);
        if (wasLiked) next.delete(placeId);
        else next.add(placeId);
        return next;
      });

      const ok = wasLiked
        ? await removeFromWishlist(resolvedUid, placeId)
        : await addToWishlist(resolvedUid, placeId);

      if (!ok) {
        // Revert the optimistic update if the write failed.
        setLikedIds(prev => {
          const next = new Set(prev);
          if (wasLiked) next.add(placeId);
          else next.delete(placeId);
          return next;
        });
      }
    },
    [userId, likedIds],
  );

  return { isLiked, toggleLike };
};
