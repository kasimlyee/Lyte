


# ⚡ Lyte — A Reactive JavaScript Framework

[![Version](https://img.shields.io/npm/v/lyte.svg)](https://www.npmjs.com/package/lyte)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/kasimlyee/lyte/actions/workflows/ci.yml/badge.svg)](https://github.com/kasimlyee/lyte/actions)
![Status](https://img.shields.io/badge/status-in%20development-orange)

> **Lightweight, high-performance reactive framework** with fine-grained reactivity and JSX support  
> Created by **[Kasim Lyee](https://github.com/yourusername)**

---

## 🚀 Features

- ⚡ **Fine-grained reactivity** with signals, effects, and computed values
- 🖼️ **JSX templating** for intuitive UI development
- 🧩 **Component architecture** with functional components
- 🔄 **Optimized rendering** with batched DOM updates
- 📦 **Tiny footprint** (~5KB gzipped)
- ⚙️ **First-class TypeScript support**
- 🌐 **SSR support** for server-side rendering
- 🔌 **Extensible plugin system**

---

## 🔧 Installation

```bash
npm install lyte
# or
yarn add lyte
# or
pnpm add lyte
```

---

## 🎯 Quick Start

### Counter Example

```jsx
import { createSignal } from 'lyte';
import { render } from 'lyte/dom';

function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <div>
      <h1>Count: {count()}</h1>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
}

render(<Counter />, document.getElementById('app'));
```

---

## 📖 Documentation

| Topic                  | Description                          |
|------------------------|--------------------------------------|
| [Reactivity System](docs/reactivity.md) | Signals, effects, computed values |
| [JSX Patterns](docs/jsx-patterns.md) | Component composition tips |
| [API Reference](docs/api-reference.md) | Complete API documentation |
| [Performance Guide](docs/performance.md) | Optimization strategies |

> 📘 Full documentation site coming soon!

---

## 🏗️ Project Structure

Lyte is built as a monorepo with these core packages:

| Package       | Description                     |
|---------------|---------------------------------|
| `@lyte/core`  | Core reactivity system          |
| `@lyte/dom`   | DOM renderer and JSX support    |
| `@lyte/server`| SSR utilities                   |

---

## 🧪 Examples

Explore our examples to see Lyte in action:

```bash
cd examples/counter
npm install
npm run dev
```

**Available examples:**
- [Counter](examples/counter) - Basic reactivity
- [Todo App](examples/todo) - State management
- [Async Data](examples/async) - Data fetching

---

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) before submitting PRs.

**Ways to contribute:**
- Report bugs
- Suggest features
- Improve documentation
- Submit pull requests

---

## 📜 License

MIT © [Kasim Lyee](https://github.com/yourusername)

---

## 🚧 Project Status

Lyte is currently in **active development**. Current priorities:

- [x] Core reactivity system
- [x] DOM renderer
- [ ] Router implementation
- [ ] DevTools integration
- [ ] Documentation site

See our [Roadmap](#roadmap) for upcoming features.

---

## 🌟 Roadmap

### Planned Features

- [ ] `@lyte/router` package
- [ ] State management solution
- [ ] DevTools extension
- [ ] CLI tool (`lyte create`)
- [ ] Animation system
- [ ] Testing utilities

---

## ❓ Community

Get help and discuss:
- [GitHub Discussions](https://github.com/kasimlyee/lyte/discussions)
- Discord: *Coming soon*
- Twitter: *Coming soon*

> ⭐ **Star the repo** to show your support!


Key improvements:
1. Better visual hierarchy with clear section separation
2. More scannable feature list
3. Simplified tables for better mobile readability
4. Progressive disclosure of information
5. Clearer call-to-action for contributors
6. More prominent project status indicators
7. Better use of emojis for visual cues
8. Reduced redundancy while maintaining all key information
