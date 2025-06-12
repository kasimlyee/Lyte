import { effect } from "./core/effects.js";
import { batch } from "./core/batch.js";

// Fragment symbol
export const Fragment = Symbol("Fragment");

/**
 * The core hyperscript function that handles JSX transpilation
 * @param {string|Function} type The element type or component
 * @param {object} props The element properties
 * @param {...any} children Child elements
 * @returns {HTMLElement|DocumentFragment}
 */
export function h(type, props = {}, ...children) {
  // Handle fragments
  if (type === Fragment) {
    return createFragment(children);
  }

  // Handle component functions
  if (typeof type === "function") {
    return createComponent(type, props, children);
  }

  // Create DOM element
  return createElement(type, props, children);
}

function createFragment(children) {
  const fragment = document.createDocumentFragment();
  appendChildren(fragment, children);
  return fragment;
}

/**
 * Executes a component function, passing props and children (if any).
 * If children are present, they are merged into the props object under the
 * key "children", following the React convention.
 * @param {Function} Component - The component function to execute
 * @param {object} props - Properties to pass to the component
 * @param {...any} children - Child elements to pass to the component
 * @returns {*} The result of executing the component function
 */
function createComponent(Component, props, children) {
  // Merge children into props (React-style)
  if (children.length > 0) {
    props = {
      ...props,
      children: children.length === 1 ? children[0] : children,
    };
  }

  // Execute component function
  return Component(props);
}

/**
 * Creates a DOM element with the given tag name, properties and children.
 * The properties are applied to the element using applyProps, and the children
 * are appended to the element using appendChildren.
 * @param {string} tag - The tag name for the element
 * @param {object} props - Properties to apply to the element
 * @param {...any} children - Child elements to append to the element
 * @returns {Element} The created element
 */
function createElement(tag, props, children) {
  // Create element
  const element = document.createElement(tag);

  // Apply properties
  applyProps(element, props);

  // Append children
  appendChildren(element, children);

  return element;
}

/**
 * Applies properties to a DOM element.
 *
 * Properties can be applied as attributes, event listeners, class names, or styles.
 * This function is a simplified version of React's `setProps` function.
 *
 * @param {Element} element - The element to apply properties to
 * @param {object} props - The properties to apply
 */
function applyProps(element, props) {
  if (!props) return;

  for (const [key, value] of Object.entries(props)) {
    // Skip children (handled separately)
    if (key === "children") continue;

    // Handle event listeners (on*)
    if (key.startsWith("on") && typeof value === "function") {
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, value);
      continue;
    }

    // Handle class (can be string, array, or object)
    if (key === "class" || key === "className") {
      applyClassName(element, value);
      continue;
    }

    // Handle style object
    if (key === "style" && typeof value === "object") {
      applyStyles(element, value);
      continue;
    }

    // Handle boolean attributes
    if (typeof value === "boolean") {
      if (value) {
        element.setAttribute(key, "");
      } else {
        element.removeAttribute(key);
      }
      continue;
    }

    // Handle regular attributes
    if (value != null) {
      element.setAttribute(key, value);
    }
  }
}

/**
 * Applies the given value to the className property of the given element.
 *
 * If the value is a string, it is set directly. If the value is an array, it is
 * filtered for truthy values and then joined with a space. If the value is an
 * object, it is expected to have keys that are the class names and values that
 * are booleans indicating whether the class should be applied. The keys are
 * filtered for truthy values and then joined with a space.
 */
function applyClassName(element, value) {
  if (!value) return;

  if (typeof value === "string") {
    element.className = value;
  } else if (Array.isArray(value)) {
    element.className = value.filter(Boolean).join(" ");
  } else if (typeof value === "object") {
    element.className = Object.entries(value)
      .filter(([_, shouldApply]) => shouldApply)
      .map(([className]) => className)
      .join(" ");
  }
}

/**
 * Applies the given styles to the given element.
 *
 * The styles object should have keys that are valid CSS property names and
 * values that are the desired values for those properties. If a value is
 * undefined or null, the property is removed from the element's style object.
 */
function applyStyles(element, styles) {
  for (const [key, value] of Object.entries(styles)) {
    if (value != null) {
      element.style[key] = value;
    }
  }
}

/**
 * Appends all the given children to the given parent element.
 *
 * The children array is flattened to infinity, so children can be nested
 * arrays. If a child is null or undefined, it is skipped.
 *
 * @param {Element} parent - The parent element to append the children to.
 * @param {any[]} children - The children to append.
 */
function appendChildren(parent, children) {
  for (const child of children.flat(Infinity)) {
    appendChild(parent, child);
  }
}

/**
 * Appends the given child to the given parent element.
 *
 * The child can be a string, number, DOM node, reactive value (signal), or
 * other value. If the child is null or undefined, it is skipped. If the child
 * is a string or number, it is appended as a text node. If the child is a DOM
 * node, it is appended directly. If the child is a reactive value, it is
 * converted to a text node and the text content is updated when the value
 * changes. For all other values, the child is converted to a string and
 * appended as a text node.
 *
 * @param {Element} parent - The element to append the child to
 * @param {*} child - The child to append
 */
function appendChild(parent, child) {
  if (child == null || child === false) return;

  // Handle text nodes
  if (typeof child === "string" || typeof child === "number") {
    parent.appendChild(document.createTextNode(child));
    return;
  }

  // Handle DOM nodes
  if (child instanceof Node) {
    parent.appendChild(child);
    return;
  }

  // Handle reactive values (signals)
  if (typeof child === "function" && !(child instanceof Node)) {
    const textNode = document.createTextNode("");
    parent.appendChild(textNode);

    effect(() => {
      const value = child();
      textNode.textContent = value != null ? value : "";
    });

    return;
  }

  // Fallback - convert to string
  parent.appendChild(document.createTextNode(String(child)));
}

/**
 * Renders a JSX element to a DOM container
 * @param {HTMLElement|DocumentFragment} vnode The JSX element to render
 * @param {HTMLElement} container The DOM container to render into
 */
export function render(vnode, container) {
  batch(() => {
    // Clear container
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // Append new content
    if (vnode instanceof Node) {
      container.appendChild(vnode);
    } else {
      container.appendChild(document.createTextNode(String(vnode)));
    }
  });
}

export default {
  h,
  Fragment,
  render,
};
