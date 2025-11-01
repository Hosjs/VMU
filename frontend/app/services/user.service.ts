import { apiService } from './api.service';
import type { User } from '~/types/user';

class UserService {
  async getProfile(id: number): Promise<User> {
    const user = await apiService.get<User>(`/users/profile/${id}`);
    return user;
  }
}

export const userService = new UserService();
