-- Fix overly permissive INSERT policies
DROP POLICY IF EXISTS "System can insert transactions" ON public.wallet_transactions;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- More restrictive policies for wallet transactions
CREATE POLICY "Authenticated users can insert own transactions" ON public.wallet_transactions 
  FOR INSERT WITH CHECK (
    wallet_id IN (SELECT id FROM public.wallets WHERE user_id = auth.uid())
    OR public.has_role(auth.uid(), 'conductor')
    OR public.has_role(auth.uid(), 'admin')
  );

-- More restrictive policies for notifications
CREATE POLICY "Admins and system can create notifications" ON public.notifications 
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR auth.uid() = user_id
  );