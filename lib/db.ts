import { prisma } from './prisma';

export interface AuthenticatorDevice {
  credentialID: string;
  credentialPublicKey: string;
  counter: number;
  transports?: string[];
}

export interface UserModel {
  id: string;
  username: string;
  devices: AuthenticatorDevice[];
  currentChallenge?: string;
}

export interface PendingUserModel {
  id: string;
  username: string;
  currentChallenge: string;
}

// ユーザー操作
export const db = {
  // PendingUser 操作
  createPendingUser: async (username: string, currentChallenge: string, id?: string): Promise<PendingUserModel> => {
    // 既存のPendingUserがあれば削除（再登録の場合など）
    await prisma.pendingUser.deleteMany({
      where: { username },
    });

    const pendingUser = await prisma.pendingUser.create({
      data: {
        id,
        username,
        currentChallenge,
      },
    });

    return {
      id: pendingUser.id,
      username: pendingUser.username,
      currentChallenge: pendingUser.currentChallenge,
    };
  },
  getPendingUser: async (id: string): Promise<PendingUserModel | undefined> => {
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { id },
    });

    if (!pendingUser) return undefined;

    return {
      id: pendingUser.id,
      username: pendingUser.username,
      currentChallenge: pendingUser.currentChallenge,
    };
  },
  getPendingUserByUsername: async (username: string): Promise<PendingUserModel | undefined> => {
    const pendingUser = await prisma.pendingUser.findUnique({
      where: { username },
    });

    if (!pendingUser) return undefined;

    return {
      id: pendingUser.id,
      username: pendingUser.username,
      currentChallenge: pendingUser.currentChallenge,
    };
  },
  deletePendingUser: async (id: string) => {
    await prisma.pendingUser.delete({
      where: { id },
    });
  },

  getUser: async (id: string): Promise<UserModel | undefined> => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { devices: true },
    });

    if (!user) return undefined;

    return {
      id: user.id,
      username: user.username,
      currentChallenge: user.currentChallenge || undefined,
      devices: user.devices.map((device) => ({
        credentialID: device.credentialID,
        credentialPublicKey: device.credentialPublicKey,
        counter: device.counter,
        transports: device.transports as string[],
      })),
    };
  },
  getUserByUsername: async (username: string): Promise<UserModel | undefined> => {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { devices: true },
    });

    if (!user) return undefined;

    return {
      id: user.id,
      username: user.username,
      currentChallenge: user.currentChallenge || undefined,
      devices: user.devices.map((device) => ({
        credentialID: device.credentialID,
        credentialPublicKey: device.credentialPublicKey,
        counter: device.counter,
        transports: device.transports as string[],
      })),
    };
  },
  createUser: async (username: string, id?: string): Promise<UserModel> => {
    const user = await prisma.user.create({
      data: {
        id,
        username,
      },
      include: { devices: true },
    });

    return {
      id: user.id,
      username: user.username,
      devices: [],
    };
  },
  updateUser: async (id: string, updates: Partial<UserModel>) => {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          username: updates.username,
          currentChallenge: updates.currentChallenge,
        },
        include: { devices: true },
      });

      return {
        id: user.id,
        username: user.username,
        currentChallenge: user.currentChallenge || undefined,
        devices: user.devices.map((device) => ({
          credentialID: device.credentialID,
          credentialPublicKey: device.credentialPublicKey,
          counter: device.counter,
          transports: device.transports as string[],
        })),
      };
    } catch (error) {
      console.error('Failed to update user:', error);
      return undefined;
    }
  },
  addDevice: async (userId: string, device: AuthenticatorDevice) => {
    await prisma.authenticatorDevice.create({
      data: {
        credentialID: device.credentialID,
        credentialPublicKey: device.credentialPublicKey,
        counter: device.counter,
        transports: device.transports || [],
        userId: userId,
      },
    });
  },
  updateDeviceCounter: async (credentialID: string, newCounter: number) => {
    await prisma.authenticatorDevice.update({
      where: { credentialID },
      data: { counter: newCounter },
    });
  },
};
