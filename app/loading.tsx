export default function Loading() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-bg2">
      <div className="h-full w-1/3 animate-[loader_1s_ease-in-out_infinite] bg-accent" />
      <style>{`@keyframes loader { 0%{transform:translateX(-100%)} 100%{transform:translateX(400%)} }`}</style>
    </div>
  );
}
