"use client";

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";

export interface AppState {
  groupId: string;
  query: string;
  sort: string;
  view: "compact" | "list";
  selectedIds: string[];
}

type AppAction =
  | { type: "setGroup"; groupId: string }
  | { type: "setQuery"; query: string }
  | { type: "setSort"; sort: string }
  | { type: "setView"; view: "compact" | "list" }
  | { type: "toggleSelected"; id: string }
  | { type: "clearSelected" };

const initialState: AppState = {
  groupId: "all",
  query: "",
  sort: "素材热度",
  view: "compact",
  selectedIds: [],
};

const AppContext = createContext<{ state: AppState; dispatch: Dispatch<AppAction> } | null>(null);

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "setGroup":
      return { ...state, groupId: action.groupId, selectedIds: [] };
    case "setQuery":
      return { ...state, query: action.query };
    case "setSort":
      return { ...state, sort: action.sort };
    case "setView":
      return { ...state, view: action.view };
    case "toggleSelected":
      return {
        ...state,
        selectedIds: state.selectedIds.includes(action.id)
          ? state.selectedIds.filter((id) => id !== action.id)
          : [...state.selectedIds, action.id],
      };
    case "clearSelected":
      return { ...state, selectedIds: [] };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppState must be used within AppProvider");
  return context;
}
