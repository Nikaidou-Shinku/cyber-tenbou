import { Accessor, createSignal, onCleanup } from "solid-js";

export const isFullscreen = (ref: Accessor<HTMLElement | undefined>) => {
  const [isActive, setActive] = createSignal(false);

  const listener = () => setActive(document.fullscreenElement === ref());

  document.addEventListener("fullscreenchange", listener);

  onCleanup(() => {
    document.removeEventListener("fullscreenchange", listener);
  });

  return isActive;
};
