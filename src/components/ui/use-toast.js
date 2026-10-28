import * as React from "react";

const TOAST_LIMIT = 2;
const TOAST_REMOVE_DELAY = 4000;

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const listeners = [];
let memoryState = { toasts: [] };
const removeTimeouts = new Map();

function dispatch(action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

function scheduleRemove(id) {
  if (removeTimeouts.has(id)) return;
  const timeout = setTimeout(() => {
    removeTimeouts.delete(id);
    dispatch({ type: "REMOVE", id });
  }, TOAST_REMOVE_DELAY);
  removeTimeouts.set(id, timeout);
}

function reducer(state, action) {
  switch (action.type) {
    case "ADD":
      return { toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case "DISMISS":
      if (action.id) scheduleRemove(action.id);
      else state.toasts.forEach((t) => scheduleRemove(t.id));
      return {
        toasts: state.toasts.map((t) => (!action.id || t.id === action.id ? { ...t, open: false } : t)),
      };
    case "REMOVE":
      return { toasts: action.id ? state.toasts.filter((t) => t.id !== action.id) : [] };
    default:
      return state;
  }
}

function toast(props) {
  const id = genId();
  const dismiss = () => dispatch({ type: "DISMISS", id });
  dispatch({
    type: "ADD",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });
  return { id, dismiss };
}

function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);
  return { ...state, toast, dismiss: (id) => dispatch({ type: "DISMISS", id }) };
}

export { useToast, toast };
