import { createSignal, effect, createTransition } from "lyte";

const [data, setData] = createSignal(null);
const { startTransition } = createTransition();

effect(() => {
  if (data()) {
    // Show loaded data
  } else {
    // Show loading state
  }
});

function loadData() {
  startTransition(async () => {
    setData(null); // Immediate update
    const result = await fetchData(); // Async operation
    setData(result); // Will be batched with other updates
  });
}
