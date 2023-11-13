import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { setState } from "~/state";

export default () => {
  const navigate = useNavigate();
  const [username, setUsername] = createSignal("");

  const login = () => {
    setState("username", username);
    navigate("/lobby");
  };

  return (
    <div class="flex h-[100dvh] flex-col items-center justify-center space-y-3 bg-gray-200">
      <span class="text-2xl">赛博点棒</span>
      <form
        class="flex flex-col space-y-3 rounded bg-gray-100 p-4 shadow"
        onSubmit={(e) => {
          e.preventDefault();
          login();
        }}
      >
        <input
          class="rounded-sm p-1"
          placeholder="用户名"
          onInput={(e) => setUsername(e.currentTarget.value)}
        />
        <button
          type="submit"
          class="rounded-sm bg-blue-400 p-1 text-white shadow-sm transition-colors hover:bg-blue-500 focus:bg-blue-500 active:bg-blue-600"
        >
          登录！
        </button>
      </form>
      <span>什么年代了还在用传统点棒？？</span>
    </div>
  );
};
