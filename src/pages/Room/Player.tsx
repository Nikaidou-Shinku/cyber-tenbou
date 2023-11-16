import { createMemo, createSignal } from "solid-js";
import { Show } from "solid-js/web";
import { state } from "~/state";
import PayModal from "./PayModal";

interface PlayerProps {
  topic: string;
  username: string;
  tenbou: number;
}

export default (props: PlayerProps) => {
  const [showPay, setShowPay] = createSignal(false);

  const isSelf = createMemo(() => {
    const username = state.username;

    if (username === null) {
      console.warn("Please login first.");
      return false;
    }

    return username === props.username;
  });

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
      <div classList={{ "text-red-500": props.tenbou < 0 }}>
        <span class="text-xl">{props.tenbou}</span>
        <Show
          when={props.tenbou !== 0}
          fallback={<span class="text-sm"> 点</span>}
        >
          <span class="text-sm">00 点</span>
        </Show>
      </div>
      <Show when={showPay()}>
        <PayModal
          username={props.username}
          topic={props.topic}
          closeModal={() => setShowPay(false)}
        />
      </Show>
    </div>
  );
};
