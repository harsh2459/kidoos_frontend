import { create } from "zustand";

const KEY = "cart_items";

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
};
const save = (items) => localStorage.setItem(KEY, JSON.stringify(items));

export const useCart = create((set, get) => ({
  items: load(),
  replaceAll: (items) => set(() => { save(items || []); return { items: items || [] }; }),
  add: (book, qty = 1) => set((state) => {
    const id = book._id || book.id;
    const idx = state.items.findIndex(i => (i._id || i.id) === id);
    let items;
    if (idx >= 0) {
      items = state.items.map((i, j) =>
        j === idx ? { ...i, qty: Math.min(999, (i.qty || 1) + qty) } : i
      );
    } else {
      items = [...state.items, { ...book, qty: Math.max(1, qty) }];
    }
    save(items);
    return { items };
  }),

  setQty: (id, qty) => set((state) => {
    const n = Math.max(1, Math.min(999, Number(qty) || 1));
    const items = state.items.map(i =>
      (i._id || i.id) === id ? { ...i, qty: n } : i
    );
    save(items);
    return { items };
  }),

  inc: (id) => {
    const cur = get().items.find(i => (i._id || i.id) === id)?.qty || 0;
    get().setQty(id, cur + 1);
  },

  dec: (id) => {
    const cur = get().items.find(i => (i._id || i.id) === id)?.qty || 0;
    get().setQty(id, Math.max(1, cur - 1));
  },

  remove: (id) => set((state) => {
    const items = state.items.filter(i => (i._id || i.id) !== id);
    save(items);
    return { items };
  }),

  clear: () => set(() => { save([]); return { items: [] }; }),
}));
