import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { AxiosError } from "axios";
import { api } from "../../../shared/api/client";
import type { Point } from "../../../../entities/Point/model/types";

type PointsState = {
    items: Point[];
    isLoading: boolean;
    error?: string;

    fetch: () => Promise<void>;
    setItems: (items: Point[]) => void;
    add: (p: Point) => void;
    update: (p: Point) => void;
    removeById: (id: string | number) => void;
};


function getErrorMessage(e: unknown): string {
    if (typeof e === "string") return e;
    if (e instanceof Error) return e.message;
    const ax = e as AxiosError;
    if (ax?.isAxiosError) return ax.message;
    return "Unknown error";
}

export const usePointsStore = create<PointsState>()(
    devtools((set) => ({
        items: [],
        isLoading: false,
        error: undefined,

        fetch: async () => {
            set({ isLoading: true, error: undefined });
            try {
                const res = await api.get<Point[]>("/MapPoints");
                set({ items: res.data });
            } catch (e: unknown) {
                set({ error: getErrorMessage(e) });
            } finally {
                set({ isLoading: false });
            }
        },

        setItems: (items) => set({ items }),
        add: (p) => set((s) => ({ items: [p, ...s.items] })),
        update: (p) =>
            set((s) => ({
                items: s.items.map((i) => (i.id === p.id ? { ...i, ...p } : i)),
            })),
        removeById: (id) =>
            
            set((s) => ({
                items: s.items.filter((i) => i.id !== id),
            })),
    }))
);
