export interface User {
  id: string;
  avatar: string;
  display: string;
  token: string;
  roles: string[];
  active: boolean;
  username: string;
  timezone: string;
}
