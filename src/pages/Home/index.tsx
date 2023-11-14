import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { setState } from "~/state";
import { checkTenbou } from "~/utils";

export default () => {
  const navigate = useNavigate();
  const [tenbou, setTenbou] = createSignal("25000");
  const [username, setUsername] = createSignal("");
  const [roomName, setRoomName] = createSignal("");

  return (
    <div class="flex h-[100dvh] flex-col items-center justify-center space-y-3 bg-gray-200">
      <span class="text-2xl">赛博点棒</span>
      <form
        class="flex w-4/5 max-w-5xl flex-col space-y-3 rounded bg-gray-100 p-4 shadow"
        onSubmit={(e) => {
          e.preventDefault();

          const curUsername = username().trim();
          if (curUsername === "") {
            alert("用户名不能为空！");
            return;
          }

          const curRoomName = roomName().trim();
          if (curRoomName === "") {
            alert("房间名不能为空！");
            return;
          }

          const curTenbou = checkTenbou(tenbou().trim());
          if (curTenbou === null) {
            return;
          }

          setState("username", () => curUsername);
          setState("tenbou", () => curTenbou);
          navigate(`/room/${curRoomName}`);
        }}
      >
        <input
          class="rounded-sm border px-2 py-1"
          placeholder="用户名"
          value={username()}
          onInput={(e) => setUsername(e.currentTarget.value)}
        />
        <input
          class="rounded-sm border px-2 py-1"
          placeholder="房间名"
          value={roomName()}
          onInput={(e) => setRoomName(e.currentTarget.value)}
        />
        <input
          class="rounded-sm border px-2 py-1"
          placeholder="初始点棒数"
          type="number"
          step={100}
          min={0}
          value={tenbou()}
          onInput={(e) => setTenbou(e.currentTarget.value)}
        />
        <button
          type="submit"
          class="rounded-sm bg-blue-400 px-2 py-1 text-white shadow-sm transition-colors hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-600"
        >
          登录！
        </button>
      </form>
      <span>什么年代了还在用传统点棒？？</span>
    </div>
  );
};
