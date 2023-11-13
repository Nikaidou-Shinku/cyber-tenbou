import { createEffect, createSignal } from "solid-js";
import { Portal, Show } from "solid-js/web";
import { JSONCodec } from "nats.ws";
import { PayMsg } from "~/data/interfaces";
import { state } from "~/state";

interface PlayerProps {
  container?: HTMLDivElement;
  topic: string;
  username: string;
  tenbou: number;
}

const sc = JSONCodec();

export default (props: PlayerProps) => {
  const [ref, setRef] = createSignal<HTMLInputElement>();

  createEffect(() => {
    const curRef = ref();

    if (typeof curRef !== "undefined") {
      curRef.focus();
    }
  });

  const [showPay, setShowPay] = createSignal(false);
  const [value, setValue] = createSignal("");

  const isSelf = () => {
    const username = state.username;

    if (username === null) {
      console.warn("Please login first.");
      return false;
    }

    return username === props.username;
  };

  const pay = () => {
    const raw = value().trim();

    if (raw === "") {
      alert("填点东西啊兄弟。");
      return;
    }

    let tenbou;
    try {
      tenbou = parseInt(raw);
    } catch (error) {
      alert("你家点棒还能不是整数的吗。");
      return;
    }

    if (tenbou % 100 !== 0) {
      alert("你家点棒还能不是整百地给的吗。");
      return;
    }

    if (tenbou < 0) {
      alert("喜欢偷点棒是吧😅");
      return;
    }

    const ask = confirm(
      `即将向 ${props.username} 支付 ${tenbou} 点点棒，确认吗？`,
    );

    if (ask) {
      const username = state.username;

      if (username === null) {
        console.warn("Please login first.");
        alert("见鬼了。");
        return;
      }

      const nc = state.server;

      if (nc === null) {
        console.error("Server was not connected.");
        alert("出事了，连接服务器失败了。");
        return;
      }

      const payMsg: PayMsg = {
        type: "pay",
        from: username,
        to: props.username,
        value: tenbou / 100,
      };

      nc.publish(props.topic, sc.encode(payMsg));
      setShowPay(false);
    }
  };

  return (
    <div
      class="flex cursor-pointer justify-between border-b-2 px-2 py-3 hover:bg-gray-100"
      onClick={() => {
        if (isSelf()) {
          alert("喜欢自己一个人倒腾点棒玩是吧。");
          return;
        }

        setShowPay(true);
      }}
    >
      <div>
        <Show when={isSelf()}>
          <span class="mr-2">这是你☞</span>
        </Show>
        <span>{props.username}</span>
      </div>
      <div>
        <span class="text-xl">{props.tenbou}</span>
        <span class="text-sm">00 点</span>
      </div>
      <Show when={showPay()}>
        <Portal mount={props.container}>
          <div class="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center backdrop-blur-sm">
            <form
              class="flex w-4/5 max-w-5xl flex-col items-center space-y-6 rounded bg-white p-4 shadow"
              onSubmit={(e) => {
                e.preventDefault();
                pay();
              }}
            >
              <span class="text-xl">向 {props.username} 支付点棒</span>
              <input
                ref={setRef}
                class="w-full rounded-sm border px-2 py-1"
                placeholder="支付的点棒数"
                type="number"
                step={100}
                min={0}
                onInput={(e) => setValue(e.currentTarget.value)}
              />
              <div class="flex w-full justify-evenly">
                <button
                  class="rounded-sm bg-red-400 px-2 py-1 text-white shadow-sm transition-colors hover:bg-red-500 focus:bg-red-500 active:bg-red-600"
                  type="submit"
                >
                  确认支付
                </button>
                <button
                  class="rounded-sm bg-gray-400 px-2 py-1 text-white shadow-sm transition-colors hover:bg-gray-500 focus:bg-gray-500 active:bg-gray-600"
                  onClick={() => setShowPay(false)}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </Portal>
      </Show>
    </div>
  );
};
