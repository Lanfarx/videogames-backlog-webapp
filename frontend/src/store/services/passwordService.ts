import axios from 'axios';

export async function changePassword(currentPassword: string, newPassword: string, token: string): Promise<void> {
  await axios.post(
    'http://localhost:5097/api/profile/ChangePassword',
    { currentPassword, newPassword },
    { headers: { Authorization: `Bearer ${token}` } }
  );
}
