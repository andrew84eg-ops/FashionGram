import { create } from "zustand";
import type { FittingSlot, Item } from "@/lib/fashion";

type Draft = {
  pieces: Partial<Record<FittingSlot, Item>>;
  setPiece: (slot: FittingSlot, item: Item | null) => void;
  loadPieces: (pieces: Partial<Record<FittingSlot, Item>>) => void;
  clear: () => void;
};

export const useLookDraft = create<Draft>((set) => ({
  pieces: {},
  setPiece: (slot, item) =>
    set((s) => {
      const next = { ...s.pieces };
      if (!item) delete next[slot];
      else next[slot] = item;
      return { pieces: next };
    }),
  loadPieces: (pieces) => set({ pieces }),
  clear: () => set({ pieces: {} }),
}));
