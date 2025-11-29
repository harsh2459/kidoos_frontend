import { create } from "zustand";

const KEY = "cart_items";

const load = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
};
const save = (items) => localStorage.setItem(KEY, JSON.stringify(items));

// ✅ NEW: Validate book object before adding to cart
const isValidBook = (book) => {
  if (!book) {
    console.error("❌ CartStore: Cannot add null/undefined to cart");
    return false;
  }
  
  const id = book._id || book.id;
  if (!id) {
    console.error("❌ CartStore: Book missing _id:", book);
    return false;
  }
  
  // ✅ Check if ID is a valid MongoDB ObjectId (24 hex characters)
  const isValidId = /^[0-9a-fA-F]{24}$/.test(String(id));
  if (!isValidId) {
    console.error(`❌ CartStore: Invalid book ID format: "${id}"`);
    return false;
  }
  
  if (!book.title) {
    console.warn("⚠️ CartStore: Book missing title:", book);
  }
  
  if (!book.price || Number(book.price) <= 0) {
    console.error("❌ CartStore: Book has invalid price:", book);
    return false;
  }
  
  return true;
};

// ✅ NEW: Normalize book to cart item format (matching server structure)
const normalizeToCartItem = (book, qty = 1) => {
  const bookId = book._id || book.id;
  
  // Generate a temporary cart item ID (will be replaced by server on sync)
  const tempCartItemId = `local_${bookId}_${Date.now()}`;
  
  return {
    _id: tempCartItemId,        // Cart item ID (temporary)
    bookId: bookId,             // ✅ CRITICAL: Store actual book ID here
    title: book.title,
    authors: book.authors,
    price: book.price || book.pric || book.mrp,
    unitPriceSnapshot: book.price || book.pric || book.mrp,
    mrp: book.mrp || book.price || book.pric,
    qty: Math.max(1, qty),
    // Keep full book data for display
    assets: book.assets,
    coverUrl: book.coverUrl,
    slug: book.slug,
  };
};

// ✅ NEW: Extract book ID from cart item (handles both local and server formats)
const getBookId = (item) => {
  // Priority 1: bookId field (server format)
  if (item.bookId) {
    // If bookId is an object (populated), get its _id
    if (typeof item.bookId === 'object' && item.bookId._id) {
      return item.bookId._id;
    }
    // If bookId is a string, use it directly
    if (typeof item.bookId === 'string') {
      return item.bookId;
    }
  }
  
  // Priority 2: book._id (alternative server format)
  if (item.book?._id) {
    return item.book._id;
  }
  
  // Priority 3: _id (but only if it looks like a book ID, not a cart item ID)
  if (item._id && !item._id.startsWith('local_')) {
    return item._id;
  }
  
  // Fallback
  return item.id;
};

export const useCart = create((set, get) => ({
  items: load(),
  
  replaceAll: (items) => set(() => { 
    save(items || []); 
    return { items: items || [] }; 
  }),
  
  add: (book, qty = 1) => {
    // ✅ CRITICAL: Validate book before adding
    if (!isValidBook(book)) {
      console.error("❌ CartStore: Refusing to add invalid book to cart");
      return;
    }
    
    return set((state) => {
      const bookId = book._id || book.id;
      
      // ✅ Find existing item by bookId (not cart item _id)
      const existingItemIndex = state.items.findIndex(item => 
        getBookId(item) === bookId
      );
      
      let items;
      
      if (existingItemIndex >= 0) {
        // Update existing item
        items = state.items.map((item, index) =>
          index === existingItemIndex 
            ? { ...item, qty: Math.min(999, (item.qty || 1) + qty) } 
            : item
        );
        console.log(`✅ CartStore: Updated quantity for "${book.title}"`);
      } else {
        // Add new item with normalized structure
        const cartItem = normalizeToCartItem(book, qty);
        items = [...state.items, cartItem];
        console.log(`✅ CartStore: Added "${book.title}" to cart (Book ID: ${bookId}, Cart Item ID: ${cartItem._id})`);
      }
      
      save(items);
      return { items };
    });
  },

  setQty: (itemId, qty) => set((state) => {
    const n = Math.max(1, Math.min(999, Number(qty) || 1));
    
    // ✅ Find by either cart item _id OR bookId
    const items = state.items.map(item => {
      const matchesCartItemId = item._id === itemId;
      const matchesBookId = getBookId(item) === itemId;
      
      if (matchesCartItemId || matchesBookId) {
        return { ...item, qty: n };
      }
      return item;
    });
    
    save(items);
    return { items };
  }),

  inc: (itemId) => {
    const item = get().items.find(i => 
      i._id === itemId || getBookId(i) === itemId
    );
    const currentQty = item?.qty || 0;
    get().setQty(itemId, currentQty + 1);
  },

  dec: (itemId) => {
    const item = get().items.find(i => 
      i._id === itemId || getBookId(i) === itemId
    );
    const currentQty = item?.qty || 0;
    get().setQty(itemId, Math.max(1, currentQty - 1));
  },

  remove: (itemId) => set((state) => {
    // ✅ Remove by either cart item _id OR bookId
    const items = state.items.filter(item => {
      const matchesCartItemId = item._id === itemId;
      const matchesBookId = getBookId(item) === itemId;
      return !(matchesCartItemId || matchesBookId);
    });
    
    save(items);
    console.log(`✅ CartStore: Removed item with ID: ${itemId}`);
    return { items };
  }),

  clear: () => set(() => { 
    save([]); 
    console.log("✅ CartStore: Cart cleared");
    return { items: [] }; 
  }),
  
  // ✅ NEW: Clean invalid items from cart (synchronous, no API calls)
  cleanInvalidItems: () => {
    const state = get();
    const validItems = state.items.filter(item => {
      const bookId = getBookId(item);
      return isValidBook({ ...item, _id: bookId });
    });
    
    if (validItems.length < state.items.length) {
      const removed = state.items.length - validItems.length;
      console.warn(`⚠️ CartStore: Removed ${removed} invalid item(s) from cart`);
      save(validItems);
      set({ items: validItems });
      return validItems;
    }
    
    return state.items; // No changes needed
  },
  
  // ✅ NEW: Debug helper to inspect cart structure
  debugCart: () => {
    const state = get();
    console.log("\n" + "=".repeat(80));
    console.log("🛒 CART DEBUG INFO");
    console.log("=".repeat(80));
    console.log(`Total items: ${state.items.length}`);
    state.items.forEach((item, idx) => {
      console.log(`\n📚 Item ${idx + 1}:`);
      console.log(`   Cart Item ID (_id): ${item._id}`);
      console.log(`   Book ID (bookId): ${getBookId(item)}`);
      console.log(`   Title: ${item.title}`);
      console.log(`   Qty: ${item.qty}`);
    });
    console.log("=".repeat(80) + "\n");
  }
}));