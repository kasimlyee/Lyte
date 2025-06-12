import { createSignal, effect } from "lyte";

const [count, setCount] = createSignal(0);

effect(() => {
  console.log(`Count is: ${count()}`);
});

setCount(5); // Logs: "Count is: 5"
