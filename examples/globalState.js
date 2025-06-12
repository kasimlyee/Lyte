import { createStore } from "lyte";

const store = createStore({ count: 0, user: null });

store.subscribe((state) => {
  console.log("State changed:", state);
});

store.dispatch((prev) => ({ ...prev, count: prev.count + 1 }));
