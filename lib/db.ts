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

export interface CounterRecordModel {
  id: string;
  data: any;
  createdAt: Date;
  userId: string;
}

export interface VoiceCounterSessionModel {
  id: string;
  name: string;
  counts: any;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

// ユーザー操作
export const db = {
  // CounterRecord 操作
  createCounterRecord: async (userId: string, data: any): Promise<CounterRecordModel> => {
    const record = await prisma.counterRecord.create({
      data: {
        userId,
        data,
      },
    });
    return record;
  },

  getCounterRecords: async (userId: string, skip: number = 0, take: number = 10): Promise<{ records: CounterRecordModel[], total: number }> => {
    const [records, total] = await prisma.$transaction([
      prisma.counterRecord.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.counterRecord.count({
        where: { userId },
      }),
    ]);
    return { records, total };
  },

  deleteCounterRecord: async (userId: string, recordId: string): Promise<void> => {
    // ユーザーIDを含めて検索することで、他人のレコードを削除できないようにする
    // findFirstで存在確認してからdelete、あるいはdeleteManyでcountチェックなど方法はあるが、
    // delete({ where: { id } }) だと userId を条件にできない（idがユニークキーのため）。
    // そのため、deleteMany を使うか、事前に確認するか、あるいは prisma schema で複合キーにするか。
    // ここでは deleteMany を使って安全に削除する。
    const result = await prisma.counterRecord.deleteMany({
      where: {
        id: recordId,
        userId: userId,
      },
    });

    if (result.count === 0) {
      throw new Error('Record not found or not authorized to delete');
    }
  },

  // VoiceCounterSession 操作
  createVoiceCounterSession: async (userId: string, name: string): Promise<VoiceCounterSessionModel> => {
    const session = await prisma.voiceCounterSession.create({
      data: {
        userId,
        name,
        counts: {},
      },
    });
    return session;
  },

  getVoiceCounterSessions: async (userId: string): Promise<VoiceCounterSessionModel[]> => {
    const sessions = await prisma.voiceCounterSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
    return sessions;
  },

  getVoiceCounterSession: async (userId: string, sessionId: string): Promise<VoiceCounterSessionModel | null> => {
    const session = await prisma.voiceCounterSession.findFirst({
      where: {
        id: sessionId,
        userId: userId,
      },
    });
    return session;
  },

  updateVoiceCounterSession: async (userId: string, sessionId: string, counts: any): Promise<void> => {
    await prisma.voiceCounterSession.updateMany({
      where: {
        id: sessionId,
        userId: userId,
      },
      data: {
        counts,
      },
    });
  },

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
