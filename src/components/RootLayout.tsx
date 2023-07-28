import type { PropsWithChildren } from "react";

// TODO Should use css grid with proper landmarks
export function RootLayout(props: PropsWithChildren) {
  return (
    <main className="h-screen flex justify-center">
      <div className="w-full h-full border-x border-slate-400 md:max-w-2xl p-2 overflow-y-auto">
        {props.children}
      </div>
    </main>
  );
}