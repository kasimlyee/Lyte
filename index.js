import * as core from "./core";
import * as advanced from "./advanced";
import * as state from "./state";
import * as utils from "./utils";

const Lyte = {
  ...core,
  ...advanced,
  ...state,
  ...utils,
  version: "__VERSION__",
};

// Apply any registered plugins
utils.applyPlugins(Lyte);

// Connect dev tools in development
if (process.env.NODE_ENV === "development") {
  utils.connectDevTools();
}

export default Lyte;
