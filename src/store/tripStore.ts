import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Activity, Trip } from "@/lib/trip-schema";
import { withActivityPhoto } from "@/lib/activity-media";
import type { PendingItineraryPatch } from "@/lib/itinerary-patches";

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
  pendingPatch: PendingItineraryPatch | null;
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
  setPendingPatch: (patch: PendingItineraryPatch | null) => void;
  setActiveActivityId: (id: string | null) => void;
  setActivityPhoto: (id: string, photoUrl: string) => void;
  updateActivity: (id: string, partial: Partial<Activity>) => void;
  removeActivity: (id: string) => void;
  toggleActivityLock: (id: string) => void;
  moveActivity: (activityId: string, toDayId: string) => void;
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
      pendingPatch: null,
      activeActivityId: null,
      lastQuery: null,

      setTrip: (trip) => set({ trip: withTripActivityPhotos(trip) }),
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
      acceptChanges: () =>
        set((state) => {
          if (!state.trip || !state.pendingPatch) return { pendingAIChanges: false, pendingPatch: null };
          if (state.pendingPatch.patch.tripId !== state.trip.id) {
            return { pendingAIChanges: false, pendingPatch: null };
          }
          return {
            trip: withTripActivityPhotos(state.pendingPatch.previewTrip),
            pendingAIChanges: false,
            pendingPatch: null,
          };
        }),
      rejectChanges: () => set({ pendingAIChanges: false, pendingPatch: null }),
      setLoading: (v) => set({ isLoading: v }),
      setPendingAIChanges: (v) => set({ pendingAIChanges: v }),
      setPendingPatch: (patch) => set({ pendingPatch: patch, pendingAIChanges: Boolean(patch) }),
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
      removeActivity: (id) =>
        set((state) => {
          if (!state.trip) return state;
          return {
            trip: {
              ...state.trip,
              days: state.trip.days.map((day) => ({
                ...day,
                activities: day.activities.filter((act) => act.id !== id || act.locked),
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
      moveActivity: (activityId, toDayId) =>
        set((state) => {
          if (!state.trip) return state;
          let activity: Activity | undefined;
          const daysWithout = state.trip.days.map((day) => {
            const found = day.activities.find((a) => a.id === activityId);
            if (found && !found.locked) activity = found;
            return { ...day, activities: day.activities.filter((a) => a.id !== activityId || a.locked) };
          });
          if (!activity) return state;
          const moved = activity;
          return {
            trip: {
              ...state.trip,
              days: daysWithout.map((day) =>
                day.id === toDayId ? { ...day, activities: [...day.activities, moved] } : day,
              ),
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
        pendingPatch: state.pendingPatch,
        lastQuery: state.lastQuery,
      }),
    },
  ),
);

function withTripActivityPhotos(trip: Trip): Trip {
  return {
    ...trip,
    days: trip.days.map((day) => ({
      ...day,
      activities: day.activities.map((activity) => withActivityPhoto(activity, trip.destination)),
    })),
  };
}
