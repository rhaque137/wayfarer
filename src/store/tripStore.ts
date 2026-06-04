import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Activity, Trip } from "@/lib/trip-schema";

export type { Activity, Day, Trip } from "@/lib/trip-schema";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface TripStore {
  trip: Trip | null;
  messages: Message[];
  savedActivities: Activity[];
  isLoading: boolean;
  pendingAIChanges: boolean;
  activeActivityId: string | null;
  lastQuery: string | null;
  setTrip: (trip: Trip) => void;
  updateTrip: (partial: Partial<Trip>) => void;
  addMessage: (msg: Omit<Message, "id" | "timestamp">) => void;
  setMessages: (msgs: Message[]) => void;
  saveActivity: (activity: Activity) => void;
  unsaveActivity: (id: string) => void;
  acceptChanges: () => void;
  rejectChanges: () => void;
  setLoading: (v: boolean) => void;
  setPendingAIChanges: (v: boolean) => void;
  setActiveActivityId: (id: string | null) => void;
  setActivityPhoto: (id: string, photoUrl: string) => void;
  updateActivity: (id: string, partial: Partial<Activity>) => void;
  toggleActivityLock: (id: string) => void;
  setLastQuery: (query: string) => void;
}

export const useTripStore = create<TripStore>()(
  persist(
    (set) => ({
      trip: null,
      messages: [],
      savedActivities: [],
      isLoading: false,
      pendingAIChanges: false,
      activeActivityId: null,
      lastQuery: null,

      setTrip: (trip) => set({ trip }),
      updateTrip: (partial) =>
        set((state) => (state.trip ? { trip: { ...state.trip, ...partial } } : state)),
      addMessage: (msg) =>
        set((state) => ({
          messages: [
            ...state.messages,
            { id: crypto.randomUUID(), timestamp: Date.now(), ...msg },
          ],
        })),
      setMessages: (msgs) => set({ messages: msgs }),
      saveActivity: (activity) =>
        set((state) => ({
          savedActivities: state.savedActivities.some((a) => a.id === activity.id)
            ? state.savedActivities
            : [...state.savedActivities, activity],
        })),
      unsaveActivity: (id) =>
        set((state) => ({ savedActivities: state.savedActivities.filter((a) => a.id !== id) })),
      acceptChanges: () => set({ pendingAIChanges: false }),
      rejectChanges: () => set({ pendingAIChanges: false }),
      setLoading: (v) => set({ isLoading: v }),
      setPendingAIChanges: (v) => set({ pendingAIChanges: v }),
      setActiveActivityId: (id) => set({ activeActivityId: id }),
      setActivityPhoto: (id, photoUrl) =>
        set((state) => {
          if (!state.trip) return state;
          return {
            trip: {
              ...state.trip,
              days: state.trip.days.map((day) => ({
                ...day,
                activities: day.activities.map((act) =>
                  act.id === id ? { ...act, photoUrl } : act
                ),
              })),
            },
          };
        }),
      updateActivity: (id, partial) =>
        set((state) => {
          if (!state.trip) return state;
          return {
            trip: {
              ...state.trip,
              days: state.trip.days.map((day) => ({
                ...day,
                activities: day.activities.map((act) =>
                  act.id === id && !act.locked ? { ...act, ...partial } : act,
                ),
              })),
            },
          };
        }),
      toggleActivityLock: (id) =>
        set((state) => {
          if (!state.trip) return state;
          return {
            trip: {
              ...state.trip,
              days: state.trip.days.map((day) => ({
                ...day,
                activities: day.activities.map((act) =>
                  act.id === id ? { ...act, locked: !act.locked } : act,
                ),
              })),
            },
          };
        }),
      setLastQuery: (query) => set({ lastQuery: query }),
    }),
    {
      name: "wayfarer_trip_store",
      partialize: (state) => ({
        trip: state.trip,
        messages: state.messages,
        savedActivities: state.savedActivities,
        pendingAIChanges: state.pendingAIChanges,
        lastQuery: state.lastQuery,
      }),
    },
  ),
);
