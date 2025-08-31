"use server";

import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  count,
  getCountFromServer,
  startAfter,
  DocumentSnapshot,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { User, Transaction, BehavioralSession } from "../../data-testing";

// Helper function to serialize Firestore timestamps and other complex objects
function serializeFirestoreData(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  if (data instanceof Timestamp) {
    return data.toMillis();
  }
  
  if (data && typeof data === 'object' && data.toDate && typeof data.toDate === 'function') {
    // Handle Firestore Timestamp objects
    return data.toDate().getTime();
  }
  
  if (data && typeof data === 'object' && data.seconds !== undefined && data.nanoseconds !== undefined) {
    // Handle Firestore Timestamp-like objects
    return data.seconds * 1000 + Math.floor(data.nanoseconds / 1000000);
  }
  
  if (Array.isArray(data)) {
    return data.map(serializeFirestoreData);
  }
  
  if (typeof data === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(data)) {
      serialized[key] = serializeFirestoreData(value);
    }
    return serialized;
  }
  
  return data;
}

// Collections
const USERS_COLLECTION = "users";
const TRANSACTIONS_COLLECTION = "transactions";
const BEHAVIORAL_SESSIONS_COLLECTION = "raw_behavioral_sessions";
const BEHAVIOR_PROFILES_COLLECTION = "behaviour_profiles";
const RISK_SCORES_COLLECTION = "risk_scores";

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalTransactionAmount: number;
  totalBehavioralSessions: number;
  appVersions: { version: string; count: number; percentage: number }[];
  recentUsers: User[];
  recentTransactions: Transaction[];
  userGrowth: { month: string; users: number }[];
  transactionTrends: { month: string; amount: number; count: number }[];
}

export async function getAdminStats(): Promise<AdminStats> {
  try {
    // Get total users count
    const usersCountSnapshot = await getCountFromServer(
      collection(db, USERS_COLLECTION)
    );
    const totalUsers = usersCountSnapshot.data().count;

    // Get active users count (users who logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsersQuery = query(
      collection(db, USERS_COLLECTION),
      where("lastLoginAt", ">=", thirtyDaysAgo.toISOString())
    );
    const activeUsersSnapshot = await getCountFromServer(activeUsersQuery);
    const activeUsers = activeUsersSnapshot.data().count;

    // Get total transactions count
    const transactionsCountSnapshot = await getCountFromServer(
      collection(db, TRANSACTIONS_COLLECTION)
    );
    const totalTransactions = transactionsCountSnapshot.data().count;

    // Get total behavioral sessions count
    const behavioralSessionsCountSnapshot = await getCountFromServer(
      collection(db, BEHAVIORAL_SESSIONS_COLLECTION)
    );
    const totalBehavioralSessions =
      behavioralSessionsCountSnapshot.data().count;

    // Get recent users (last 10)
    const recentUsersQuery = query(
      collection(db, USERS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const recentUsersSnapshot = await getDocs(recentUsersQuery);
    const recentUsers: User[] = recentUsersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        mobile: data.mobile || "",
        fullName: data.fullName || "",
        emailId: data.emailId || "",
        age: data.age || 0,
        gender: data.gender || "male",
        profile: data.profile || null,
        bankName: data.bankName || "",
        accountNumber: data.accountNumber || "",
        ifscCode: data.ifscCode || "",
        branchName: data.branchName || "",
        accountType: data.accountType || "savings",
        balance: data.balance || 0,
        pinHash: data.pinHash || null,
        recoveryQuestions: data.recoveryQuestions || [],
        biometricEnabled: data.biometricEnabled || false,
        biometricType: data.biometricType || null,
        createdAt: data.createdAt?.toDate?.()
          ? data.createdAt.toDate().toISOString()
          : data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()
          ? data.updatedAt.toDate().toISOString()
          : data.updatedAt || new Date().toISOString(),
        isActive: data.isActive ?? true,
        lastLoginAt: data.lastLoginAt?.toDate?.()
          ? data.lastLoginAt.toDate().toISOString()
          : data.lastLoginAt || null,
        fcmToken: data.fcmToken || null,
      } as User;
    });

    // Get recent transactions (last 10)
    const recentTransactionsQuery = query(
      collection(db, TRANSACTIONS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const recentTransactionsSnapshot = await getDocs(recentTransactionsQuery);
    const recentTransactions: Transaction[] =
      recentTransactionsSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()
            ? data.createdAt.toDate().toISOString()
            : data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt,
        } as Transaction;
      });

    // Calculate total transaction amount
    const totalTransactionAmount = recentTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    // Get app versions from users
    const allUsersQuery = query(collection(db, USERS_COLLECTION));
    const allUsersSnapshot = await getDocs(allUsersQuery);
    const appVersionsMap = new Map<string, number>();

    allUsersSnapshot.docs.forEach((doc) => {
      const userData = doc.data();
      // Assuming app version might be stored in user data or we'll use a default
      const version = userData.appVersion || "1.0.0";
      appVersionsMap.set(version, (appVersionsMap.get(version) || 0) + 1);
    });

    const totalVersionUsers = Array.from(appVersionsMap.values()).reduce(
      (sum, count) => sum + count,
      0
    );
    const appVersions = Array.from(appVersionsMap.entries()).map(
      ([version, count]) => ({
        version,
        count,
        percentage:
          totalVersionUsers > 0 ? (count / totalVersionUsers) * 100 : 0,
      })
    );

    // Calculate real user growth data (last 7 days)
    const userGrowth = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Count users created on this day
      const dayUsersCount = recentUsers.filter((user) => {
        const userDate = new Date(user.createdAt);
        return userDate >= startOfDay && userDate <= endOfDay;
      }).length;

      userGrowth.push({
        month: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        users: dayUsersCount,
      });
    }

    // Calculate real transaction trends (last 7 days)
    const transactionTrends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      // Calculate transactions for this day
      const dayTransactions = recentTransactions.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        return transactionDate >= startOfDay && transactionDate <= endOfDay;
      });

      const dayAmount = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

      transactionTrends.push({
        month: date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
        }),
        amount: dayAmount,
        count: dayTransactions.length,
      });
    }

    return {
      totalUsers,
      activeUsers,
      totalTransactions,
      totalTransactionAmount,
      totalBehavioralSessions,
      appVersions,
      recentUsers,
      recentTransactions,
      userGrowth,
      transactionTrends,
    };
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    throw error;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const usersQuery = query(
      collection(db, USERS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(usersQuery);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        lastLoginAt:
          data.lastLoginAt?.toDate?.()?.toISOString() || data.lastLoginAt,
      } as User;
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
}

export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const transactionsQuery = query(
      collection(db, TRANSACTIONS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(transactionsQuery);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as Transaction;
    });
  } catch (error) {
    console.error("Error fetching all transactions:", error);
    return []; // Return empty array instead of throwing
  }
}

export async function getAllBehavioralSessions(): Promise<any[]> {
  try {
    const sessionsQuery = query(
      collection(db, BEHAVIORAL_SESSIONS_COLLECTION),
      orderBy("timestamp", "desc"),
      limit(100) // Limit to prevent overwhelming data
    );
    const snapshot = await getDocs(sessionsQuery);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });
  } catch (error) {
    console.error("Error fetching behavioral sessions:", error);
    return []; // Return empty array instead of throwing
  }
}

export async function getUserById(userId: string): Promise<User | null> {
  try {
    const userQuery = query(
      collection(db, USERS_COLLECTION),
      where("__name__", "==", userId)
    );
    const snapshot = await getDocs(userQuery);
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      mobile: data.mobile || "",
      fullName: data.fullName || "",
      emailId: data.emailId || "",
      age: data.age || 0,
      gender: data.gender || "male",
      profile: data.profile || null,
      bankName: data.bankName || "",
      accountNumber: data.accountNumber || "",
      ifscCode: data.ifscCode || "",
      branchName: data.branchName || "",
      accountType: data.accountType || "savings",
      balance: data.balance || 0,
      pinHash: data.pinHash || null,
      recoveryQuestions: data.recoveryQuestions || [],
      biometricEnabled: data.biometricEnabled || false,
      biometricType: data.biometricType || null,
      createdAt:
        data.createdAt?.toDate?.()?.toISOString() ||
        data.createdAt ||
        new Date().toISOString(),
      updatedAt:
        data.updatedAt?.toDate?.()?.toISOString() ||
        data.updatedAt ||
        new Date().toISOString(),
      isActive: data.isActive ?? true,
      lastLoginAt:
        data.lastLoginAt?.toDate?.()?.toISOString() || data.lastLoginAt || null,
      fcmToken: data.fcmToken || null,
    } as User;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
}

export async function getUserTransactions(
  userId: string
): Promise<Transaction[]> {
  try {
    // Use simpler query without orderBy to avoid composite index requirement
    const transactionsQuery = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where("fromUserId", "==", userId)
    );
    const snapshot = await getDocs(transactionsQuery);
    const transactions = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as Transaction;
    });

    // Sort in memory by createdAt descending
    return transactions.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    return []; // Return empty array instead of throwing
  }
}

export async function getUserBehavioralSessions(
  userId: string
): Promise<any[]> {
  try {
    // Use simpler query without orderBy to avoid composite index requirement
    const sessionsQuery = query(
      collection(db, BEHAVIORAL_SESSIONS_COLLECTION),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(sessionsQuery);
    const sessions = snapshot.docs.map((doc) => {
      const data = doc.data();
      const serializedData = serializeFirestoreData(data);
      return {
        id: doc.id,
        ...serializedData,
        timestamp: serializedData.timestamp || 0,
      };
    });

    // Sort in memory by timestamp descending and limit to 20
    return sessions
      .sort((a, b) => {
        const timestampA = a.timestamp || 0;
        const timestampB = b.timestamp || 0;
        return timestampB - timestampA;
      })
      .slice(0, 20);
  } catch (error) {
    console.error("Error fetching user behavioral sessions:", error);
    return []; // Return empty array instead of throwing
  }
}

export async function getTransactionById(
  transactionId: string
): Promise<Transaction | null> {
  try {
    const transactionQuery = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where("__name__", "==", transactionId)
    );
    const snapshot = await getDocs(transactionQuery);
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
    } as Transaction;
  } catch (error) {
    console.error("Error fetching transaction by ID:", error);
    throw error;
  }
}

export async function getBehavioralSessionById(
  sessionId: string
): Promise<any | null> {
  try {
    const sessionQuery = query(
      collection(db, BEHAVIORAL_SESSIONS_COLLECTION),
      where("__name__", "==", sessionId)
    );
    const snapshot = await getDocs(sessionQuery);
    if (snapshot.empty) {
      return null;
    }
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    };
  } catch (error) {
    console.error("Error fetching behavioral session by ID:", error);
    throw error;
  }
}

// Paginated server actions
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: Record<string, any>;
}

export async function getPaginatedTransactions(
  page: number = 1,
  pageSize: number = 10,
  filters: {
    search?: string;
    status?: string;
    type?: string;
    category?: string;
    userId?: string;
  } = {}
): Promise<PaginatedResponse<Transaction>> {
  try {
    const baseQuery = collection(db, TRANSACTIONS_COLLECTION);
    const constraints: any[] = [orderBy("createdAt", "desc")];

    // Add filters
    if (filters.userId) {
      constraints.push(where("fromUserId", "==", filters.userId));
    }
    if (filters.status && filters.status !== "all") {
      constraints.push(where("status", "==", filters.status));
    }
    if (filters.type && filters.type !== "all") {
      constraints.push(where("type", "==", filters.type));
    }
    if (filters.category && filters.category !== "all") {
      constraints.push(where("category", "==", filters.category));
    }

    // Get total count for pagination info
    const countQuery = query(baseQuery, ...constraints);
    const countSnapshot = await getCountFromServer(countQuery);
    const totalItems = countSnapshot.data().count;
    const totalPages = Math.ceil(totalItems / pageSize);

    // For simple pagination, we'll fetch all documents and slice them
    // This is not optimal for large datasets but works for the current use case
    const allDocsQuery = query(baseQuery, ...constraints);
    const allSnapshot = await getDocs(allDocsQuery);

    if (!allSnapshot || !allSnapshot.docs) {
      return {
        data: [],
        pagination: {
          currentPage: page,
          pageSize,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filters,
      };
    }

    // Map all documents first
    let allTransactions = allSnapshot.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      } as Transaction;
    });

    // Apply client-side search filter
    if (filters.search) {
      allTransactions = allTransactions.filter(
        (transaction) =>
          transaction.reference
            ?.toLowerCase()
            .includes(filters.search!.toLowerCase()) ||
          transaction.description
            ?.toLowerCase()
            .includes(filters.search!.toLowerCase()) ||
          transaction.fromMobile?.includes(filters.search!) ||
          transaction.toMobile?.includes(filters.search!) ||
          transaction.amount.toString().includes(filters.search!)
      );
    }

    // Recalculate pagination after filtering
    const filteredTotalItems = allTransactions.length;
    const filteredTotalPages = Math.ceil(filteredTotalItems / pageSize);

    // Apply pagination to filtered results
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTransactions = allTransactions.slice(startIndex, endIndex);

    return {
      data: paginatedTransactions,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: filteredTotalItems,
        totalPages: filteredTotalPages,
        hasNextPage: page < filteredTotalPages,
        hasPreviousPage: page > 1,
      },
      filters,
    };
  } catch (error) {
    console.error("Error fetching paginated transactions:", error);
    throw error;
  }
}

export async function getPaginatedBehavioralSessions(
  page: number = 1,
  pageSize: number = 10,
  filters: {
    search?: string;
    behaviorFilter?: string;
    userId?: string;
  } = {}
): Promise<PaginatedResponse<any>> {
  try {
    const baseQuery = collection(db, BEHAVIORAL_SESSIONS_COLLECTION);
    const constraints: any[] = [orderBy("timestamp", "desc")];

    // Add filters
    if (filters.userId) {
      constraints.push(where("userId", "==", filters.userId));
    }

    // Get total count for pagination info
    const countQuery = query(baseQuery, ...constraints);
    const countSnapshot = await getCountFromServer(countQuery);
    const totalItems = countSnapshot.data().count;
    const totalPages = Math.ceil(totalItems / pageSize);

    // For simple pagination, we'll fetch all documents and slice them
    // This is not optimal for large datasets but works for the current use case
    const allDocsQuery = query(baseQuery, ...constraints);
    const allSnapshot = await getDocs(allDocsQuery);

    if (!allSnapshot || !allSnapshot.docs) {
      return {
        data: [],
        pagination: {
          currentPage: page,
          pageSize,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filters,
      };
    }

    // Map all documents first
    let allSessions = allSnapshot.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        sessionId: data.sessionId || "",
        userId: data.userId || "",
        timestamp: data.timestamp || 0,
        touchPatterns: data.touchPatterns || [],
        typingPatterns: data.typingPatterns || [],
        motionPattern: data.motionPattern || [],
        loginBehavior: data.loginBehavior || {},
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      };
    });

    // Apply client-side filters
    if (filters.search) {
      allSessions = allSessions.filter(
        (session) =>
          session.sessionId
            ?.toLowerCase()
            .includes(filters.search!.toLowerCase()) ||
          session.userId?.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.behaviorFilter && filters.behaviorFilter !== "all") {
      allSessions = allSessions.filter((session) => {
        switch (filters.behaviorFilter) {
          case "motion":
            return session.motionPattern && session.motionPattern.length > 0;
          case "touch":
            return session.touchPatterns && session.touchPatterns.length > 0;
          case "typing":
            return session.typingPatterns && session.typingPatterns.length > 0;
          default:
            return true;
        }
      });
    }

    // Recalculate pagination after filtering
    const filteredTotalItems = allSessions.length;
    const filteredTotalPages = Math.ceil(filteredTotalItems / pageSize);

    // Apply pagination to filtered results
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedSessions = allSessions.slice(startIndex, endIndex);

    return {
      data: paginatedSessions,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: filteredTotalItems,
        totalPages: filteredTotalPages,
        hasNextPage: page < filteredTotalPages,
        hasPreviousPage: page > 1,
      },
      filters,
    };
  } catch (error) {
    console.error("Error fetching paginated behavioral sessions:", error);
    throw error;
  }
}

export async function getPaginatedUsers(
  page: number = 1,
  pageSize: number = 10,
  filters: {
    search?: string;
    statusFilter?: string;
    verificationFilter?: string;
  } = {}
): Promise<PaginatedResponse<User>> {
  try {
    const baseQuery = collection(db, USERS_COLLECTION);
    const constraints: any[] = [orderBy("createdAt", "desc")];

    // Add filters
    if (filters.statusFilter && filters.statusFilter !== "all") {
      constraints.push(where("status", "==", filters.statusFilter));
    }
    if (filters.verificationFilter && filters.verificationFilter !== "all") {
      const isVerified = filters.verificationFilter === "verified";
      constraints.push(where("biometricEnabled", "==", isVerified));
    }

    // Get total count for pagination info
    const countQuery = query(baseQuery, ...constraints);
    const countSnapshot = await getCountFromServer(countQuery);
    const totalItems = countSnapshot.data().count;
    const totalPages = Math.ceil(totalItems / pageSize);

    // For simple pagination, we'll fetch all documents and slice them
    // This is not optimal for large datasets but works for the current use case
    const allDocsQuery = query(baseQuery, ...constraints);
    const allSnapshot = await getDocs(allDocsQuery);

    if (!allSnapshot || !allSnapshot.docs) {
      return {
        data: [],
        pagination: {
          currentPage: page,
          pageSize,
          totalItems: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        filters,
      };
    }

    // Map all documents first
    let allUsers = allSnapshot.docs.map((doc) => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
        lastLoginAt:
          data.lastLoginAt?.toDate?.()?.toISOString() || data.lastLoginAt,
      } as User;
    });

    // Apply client-side search filter
    if (filters.search) {
      allUsers = allUsers.filter(
        (user) =>
          user.fullName
            ?.toLowerCase()
            .includes(filters.search!.toLowerCase()) ||
          user.emailId?.toLowerCase().includes(filters.search!.toLowerCase()) ||
          user.mobile?.includes(filters.search!)
      );
    }

    // Recalculate pagination after filtering
    const filteredTotalItems = allUsers.length;
    const filteredTotalPages = Math.ceil(filteredTotalItems / pageSize);

    // Apply pagination to filtered results
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = allUsers.slice(startIndex, endIndex);

    return {
      data: paginatedUsers,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: filteredTotalItems,
        totalPages: filteredTotalPages,
        hasNextPage: page < filteredTotalPages,
        hasPreviousPage: page > 1,
      },
      filters,
    };
  } catch (error) {
    console.error("Error fetching paginated users:", error);
    throw error;
  }
}

// New interfaces for behavior profiles, vector embeddings, and risk scores
export interface BehaviorProfile {
  userId: string;
  DeviceFingerprint: object;
  simOperator: string;
  locationPatterns: {
    altitude: number;
    timezone: string;
    latitude: number;
    longitude: number;
    timestamp: number;
    vpnDetected: boolean;
  }[];
}

export interface VectorEmbedding {
  id: string;
  values: number[];
  metadata: {
    userId: string;
    sessionId: string;
    timestamp: string;
    type: "motion" | "gesture" | "typing";
    [key: string]: any;
  };
}

export interface RiskScore {
  id: string;
  userId: string;
  sessionId: string;
  riskLevel: "low" | "medium" | "high";
  totalScore: number;
  reason: string;
  recommendation: string;
  breakdown: {
    locationRisk: number;
    behaviorRisk: number;
    deviceRisk: number;
    networkRisk: number;
    typingRisk: number;
  };
  alerts: {
    type: string;
    message: string;
    severity: "low" | "medium" | "high";
  }[];
  extraInfo: {
    locationCoordinates: {
      latitude: number;
      longitude: number;
      accuracy: number;
      timestamp: string | number;
    };
  };
  timestamp: any;
  createdAt: any;
}

// Get behavior profile for a specific user
export async function getUserBehaviorProfile(
  userId: string
): Promise<BehaviorProfile | null> {
  try {
    const behaviorProfileQuery = query(
      collection(db, BEHAVIOR_PROFILES_COLLECTION),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(behaviorProfileQuery);

    if (snapshot.empty) {
      console.log(`No behavior profile found for user: ${userId}`);
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      userId: doc.id,
      ...doc.data(),
    } as BehaviorProfile;
  } catch (error) {
    console.error("Error fetching user behavior profile:", error);
    // Return null instead of throwing to allow graceful handling
    return null;
  }
}

// Get risk scores for a specific user with pagination
export async function getUserRiskScores(
  userId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<RiskScore>> {
  try {
    const riskScoresQuery = query(
      collection(db, RISK_SCORES_COLLECTION),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );

    const snapshot = await getDocs(riskScoresQuery);
    const allRiskScores = snapshot.docs.map((doc) => {
      const data = doc.data();
      const serializedData = serializeFirestoreData(data);
      return {
        id: doc.id,
        ...serializedData,
      };
    }) as RiskScore[];

    const totalItems = allRiskScores.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = allRiskScores.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      filters: { userId },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.log(`Failed to fetch risk scores for user ${userId}:`, errorMessage);
    
    // Check if the error is related to missing composite index
    if (errorMessage.includes("requires an index") || errorMessage.includes("composite index")) {
      console.log("\n🔍 FIRESTORE INDEX REQUIRED:");
      console.log("The query requires a composite index for optimal performance.");
      console.log("\n📋 TO CREATE THE INDEX AUTOMATICALLY:");
      console.log("1. Check your browser console for a Firestore error with a direct link");
      console.log("2. Click the link in the error message to auto-create the index");
      console.log("3. Or manually create a composite index in Firebase Console:");
      console.log("   - Collection: risk_scores");
      console.log("   - Field 1: userId (Ascending)");
      console.log("   - Field 2: timestamp (Descending)");
      console.log("\n⏳ Index creation usually takes a few seconds to minutes.");
      console.log("\n🔄 Once created, refresh the page to see your risk scores.");
    }
    
    // Return empty result instead of throwing to allow graceful handling
    return {
      data: [],
      pagination: {
        currentPage: page,
        pageSize,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      filters: { userId },
    };
  }
}

// Get latest risk score for a user
export async function getUserLatestRiskScore(
  userId: string
): Promise<RiskScore | null> {
  try {
    const riskScoreQuery = query(
      collection(db, RISK_SCORES_COLLECTION),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const snapshot = await getDocs(riskScoreQuery);

    if (snapshot.empty) {
      console.log(`No risk scores found for user: ${userId}`);
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
    } as RiskScore;
  } catch (error) {
    console.log(
      `Failed to fetch latest risk score for user ${userId}:`,
      error instanceof Error ? error.message : "Unknown error"
    );
    // Return null instead of throwing to allow graceful handling
    return null;
  }
}

// Note: Vector embeddings from Pinecone would typically be fetched via Pinecone API
// This is a placeholder function that would need to be implemented with Pinecone SDK
export async function getUserVectorEmbeddings(userId: string): Promise<{
  motion: VectorEmbedding[];
  gesture: VectorEmbedding[];
  typing: VectorEmbedding[];
}> {
  try {
    // This would typically use Pinecone SDK to query the vector databases
    // For now, returning empty arrays as placeholder
    console.log("Fetching vector embeddings for user:", userId);

    return {
      motion: [],
      gesture: [],
      typing: [],
    };
  } catch (error) {
    console.error("Error fetching user vector embeddings:", error);
    throw error;
  }
}
