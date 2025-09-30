export function isAdminUser(user) {
  const envEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  return user?.is_admin === true || (user?.email?.toLowerCase() === envEmail);
}
