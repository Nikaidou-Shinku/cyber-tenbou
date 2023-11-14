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

export const checkTenbou = (tenbou: string): number | null => {
  if (tenbou === "") {
    alert("填点东西啊兄弟。");
    return null;
  }

  let value;
  try {
    value = parseInt(tenbou);
  } catch (error) {
    alert("你家点棒还能不是整数的吗。");
    return null;
  }

  if (value % 100 !== 0) {
    alert("你家点棒还能不是整百地给的吗。");
    return null;
  }

  return value / 100;
};
