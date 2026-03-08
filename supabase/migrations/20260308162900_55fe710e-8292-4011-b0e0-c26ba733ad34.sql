
-- Allow all authenticated users to insert notifications (needed for cross-dashboard sync)
DROP POLICY IF EXISTS "Admins and system can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (true);
