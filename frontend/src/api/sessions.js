import axiosInstance from "../lib/axios";
import { PROBLEMS } from "../data/problems";

export const sessionApi = {
  createSession: async (data) => {
    try {
      const response = await axiosInstance.post("/sessions", data);
      return response.data;
    } catch (_) {
      console.warn("Backend API unavailable, using local demo session");
      const problemObj =
        Object.values(PROBLEMS).find((p) => p.title === data.problem) || Object.values(PROBLEMS)[0];
      
      const mockSession = {
        _id: "session-" + Date.now(),
        problem: problemObj.title,
        difficulty: data.difficulty || "easy",
        status: "active",
        createdAt: new Date().toISOString(),
        host: { name: "You (Host)", clerkId: "host-user", email: "host@example.com" },
        participant: null,
      };

      const existing = JSON.parse(localStorage.getItem("demo_sessions") || "[]");
      existing.unshift(mockSession);
      localStorage.setItem("demo_sessions", JSON.stringify(existing));

      return { session: mockSession };
    }
  },

  getActiveSessions: async () => {
    try {
      const response = await axiosInstance.get("/sessions/active");
      return response.data;
    } catch (err) {
      const existing = JSON.parse(localStorage.getItem("demo_sessions") || "[]");
      return { sessions: existing.filter((s) => s.status === "active") };
    }
  },

  getMyRecentSessions: async () => {
    try {
      const response = await axiosInstance.get("/sessions/my-recent");
      return response.data;
    } catch (err) {
      const existing = JSON.parse(localStorage.getItem("demo_sessions") || "[]");
      return { sessions: existing.filter((s) => s.status === "completed") };
    }
  },

  getSessionById: async (id) => {
    try {
      const response = await axiosInstance.get(`/sessions/${id}`);
      return response.data;
    } catch (err) {
      const existing = JSON.parse(localStorage.getItem("demo_sessions") || "[]");
      const found = existing.find((s) => s._id === id);
      if (found) return { session: found };

      const firstProb = Object.values(PROBLEMS)[0];
      return {
        session: {
          _id: id,
          problem: firstProb.title,
          difficulty: "easy",
          status: "active",
          host: { name: "You (Host)", clerkId: "host-user" },
        },
      };
    }
  },

  joinSession: async (id) => {
    try {
      const response = await axiosInstance.post(`/sessions/${id}/join`);
      return response.data;
    } catch (_) {
      const existing = JSON.parse(localStorage.getItem("demo_sessions") || "[]");
      const session = existing.find((s) => s._id === id);
      if (session) {
        session.participant = { name: "Participant", clerkId: "participant-user" };
        localStorage.setItem("demo_sessions", JSON.stringify(existing));
        return { session };
      }
      return { session: null };
    }
  },

  endSession: async (id) => {
    try {
      const response = await axiosInstance.post(`/sessions/${id}/end`);
      return response.data;
    } catch (_) {
      const existing = JSON.parse(localStorage.getItem("demo_sessions") || "[]");
      const session = existing.find((s) => s._id === id);
      if (session) {
        session.status = "completed";
        localStorage.setItem("demo_sessions", JSON.stringify(existing));
        return { session, message: "Session ended successfully" };
      }
      return { message: "Session ended" };
    }
  },

  getStreamToken: async () => {
    try {
      const response = await axiosInstance.get(`/chat/token`);
      return response.data;
    } catch (_) {
      return { token: "demo-token" };
    }
  },

  getStats: async () => {
    try {
      const response = await axiosInstance.get(`/sessions/stats`);
      return response.data;
    } catch (_) {
      const existing = JSON.parse(localStorage.getItem("demo_sessions") || "[]");
      return {
        totalSessionsCount: existing.length,
        completedSessionsCount: existing.filter((s) => s.status === "completed").length,
      };
    }
  },
};

