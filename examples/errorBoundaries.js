import { effect, withErrorBoundary } from "lyte";

const riskyEffect = withErrorBoundary(
  () => {
    // Code that might throw
  },
  (error) => {
    console.error("Caught error:", error);
  }
);

effect(riskyEffect);
