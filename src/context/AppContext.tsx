"use client";

import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from "react";

export interface AppState {
  groupId: string;
  query: string;
  sort: string;
  filters: Record<string, string[]>;
  view: "compact" | "list";
  selectedIds: string[];
  basketIds: string[];
  similarAssetId: string | null;
}

type AppAction =
  | { type: "setGroup"; groupId: string }
  | { type: "setQuery"; query: string }
  | { type: "setSort"; sort: string }
  | { type: "toggleFilter"; label: string; value: string }
  | { type: "clearFilter"; label: string }
  | { type: "setView"; view: "compact" | "list" }
  | { type: "toggleSelected"; id: string }
  | { type: "clearSelected" }
  | { type: "addToBasket"; id: string }
  | { type: "addSelectedToBasket" }
  | { type: "removeFromBasket"; id: string }
  | { type: "clearBasket" }
  | { type: "setSimilarAsset"; id: string | null };

const initialState: AppState = {
  groupId: "all",
  query: "",
  sort: "素材热度",
  filters: {},
  view: "compact",
  selectedIds: [],
  basketIds: [],
  similarAssetId: null,
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
    case "toggleFilter": {
      const current = state.filters[action.label] || [];
      const next = current.includes(action.value) ? current.filter((value) => value !== action.value) : [...current, action.value];
      const filters = { ...state.filters };
      if (next.length) filters[action.label] = next;
      else delete filters[action.label];
      return { ...state, filters, selectedIds: [] };
    }
    case "clearFilter": {
      const filters = { ...state.filters };
      delete filters[action.label];
      return { ...state, filters, selectedIds: [] };
    }
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
    case "addToBasket":
      return { ...state, basketIds: [...new Set([...state.basketIds, action.id])] };
    case "addSelectedToBasket":
      return { ...state, basketIds: [...new Set([...state.basketIds, ...state.selectedIds])] };
    case "removeFromBasket":
      return { ...state, basketIds: state.basketIds.filter((id) => id !== action.id) };
    case "clearBasket":
      return { ...state, basketIds: [] };
    case "setSimilarAsset":
      return { ...state, similarAssetId: action.id, selectedIds: [] };
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
