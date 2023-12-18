import { createEffect, createSignal } from "solid-js";
import { Portal } from "solid-js/web";
import { state } from "~/state";
import { calcPoint, checkTenbou, textEncoder } from "~/utils";

interface PayModalProps {
  /**
   * Encoded room name.
   */
  roomName: string;
  /**
   * Encoded user name.
   */
  username: string;
  closeModal: () => void;
}

export default (props: PayModalProps) => {
  const [ref, setRef] = createSignal<HTMLInputElement>();

  const focusTenbouInput = () => {
    const curRef = ref();

    if (typeof curRef !== "undefined") {
      curRef.focus();
    }
  };

  createEffect(focusTenbouInput);

  const [han, setHan] = createSignal("");
  const [fu, setFu] = createSignal("");
  const [isTsumo, setTsumo] = createSignal(false);
  const [isOya, setOya] = createSignal(false);

  const calc = () => {
    const rawHan = han().trim();
    const rawFu = fu().trim();

    const point = calcPoint(rawHan, rawFu, isTsumo(), isOya());
    if (point === null) {
      return;
    }

    setValue(`${point}`);
    focusTenbouInput();
  };

  const [value, setValue] = createSignal("");

  const pay = async () => {
    const raw = value().trim();

    const tenbou = checkTenbou(raw);
    if (tenbou === null) {
      return;
    }

    if (tenbou < 0) {
      alert("喜欢偷点棒是吧😅");
      return;
    }

    const ask = confirm(
      `即将向 ${textEncoder.decode(props.username)} 支付 ${
        tenbou * 100
      } 点点棒，确认吗？`,
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

      const js = nc.jetstream();
      const kv = await js.views.kv("tenbou");

      const self = await kv.get(`${props.roomName}.${username}`);
      if (self === null) {
        console.error(`Can not find player "${username}".`);
        alert(`玩家 "${username}" 的点棒数据不存在。`);
        return;
      }
      const selfTenbou = parseInt(self.string()) - tenbou;

      const target = await kv.get(`${props.roomName}.${props.username}`);
      if (target === null) {
        console.error(`Can not find player "${props.username}".`);
        alert(`玩家 "${props.username}" 的点棒数据不存在。`);
        return;
      }
      const targetTenbou = parseInt(target.string()) + tenbou;

      // FIXME: maybe meet concurrency problems, use diff messages to fix it!
      await kv.put(`${props.roomName}.${props.username}`, `${targetTenbou}`);
      await kv.put(`${props.roomName}.${username}`, `${selfTenbou}`);

      props.closeModal();
    }
  };

  return (
    <Portal>
      <div class="fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center backdrop-blur-sm">
        <div class="flex w-4/5 max-w-5xl flex-col items-center space-y-2 rounded bg-white p-4 shadow">
          <span class="text-xl">
            向 {textEncoder.decode(props.username)} 支付点棒
          </span>
          <div class="w-full border-b-2" />
          <form
            class="flex w-full flex-col items-center space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              calc();
            }}
          >
            <span class="text-lg">快捷点数计算</span>
            <div class="flex w-full items-center space-x-1">
              <input
                class="min-w-0 flex-1 rounded-sm border px-2 py-1"
                placeholder="番数"
                type="number"
                step={1}
                min={1}
                value={han()}
                onInput={(e) => setHan(e.currentTarget.value)}
              />
              <span>番</span>
              <input
                class="min-w-0 flex-1 rounded-sm border px-2 py-1"
                placeholder="符数"
                type="number"
                step={5}
                min={20}
                value={fu()}
                onInput={(e) => setFu(e.currentTarget.value)}
              />
              <span>符</span>
            </div>
            <div class="flex w-full justify-evenly">
              <div class="space-x-1">
                <input
                  id="tsumo"
                  type="checkbox"
                  checked={isTsumo()}
                  onChange={(e) => setTsumo(e.currentTarget.checked)}
                />
                <label for="tsumo">是否自摸</label>
              </div>
              <div class="space-x-1">
                <input
                  id="oya"
                  type="checkbox"
                  checked={isOya()}
                  onChange={(e) => setOya(e.currentTarget.checked)}
                />
                <label for="oya">是否庄家</label>
              </div>
            </div>
            <button
              class="rounded-sm bg-blue-400 px-2 py-1 text-white shadow-sm transition-colors hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-600"
              type="submit"
            >
              计算
            </button>
          </form>
          <div class="w-full border-b-2" />
          <form
            class="space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              pay();
            }}
          >
            <input
              ref={setRef}
              class="w-full rounded-sm border px-2 py-1"
              placeholder="支付的点棒数"
              type="number"
              step={100}
              min={0}
              value={value()}
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
                onClick={props.closeModal}
              >
                取消
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
};
