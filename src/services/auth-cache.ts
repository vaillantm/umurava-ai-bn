import { User } from '../models/user.model.js';

export type CachedAuthUser = {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  companyName?: string;
  avatarUrl?: string;
  status: string;
  passwordHash: string;
};

const authCache = new Map<string, CachedAuthUser>();

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const primeAuthCache = async () => {
  const users = await User.find({ status: 'active' })
    .select('_id fullName email role companyName avatarUrl status passwordHash')
    .lean()
    .exec();

  authCache.clear();

  for (const user of users as any[]) {
    authCache.set(normalizeEmail(user.email), {
      _id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      companyName: user.companyName,
      avatarUrl: user.avatarUrl,
      status: user.status,
      passwordHash: user.passwordHash,
    });
  }
};

export const getCachedAuthUser = (email: string) => {
  return authCache.get(normalizeEmail(email));
};

export const setCachedAuthUser = (user: CachedAuthUser) => {
  authCache.set(normalizeEmail(user.email), user);
};
