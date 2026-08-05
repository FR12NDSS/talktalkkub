REVOKE EXECUTE ON FUNCTION public.username_available(text) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.email_available(text) FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.username_available(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.email_available(text) TO service_role;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;