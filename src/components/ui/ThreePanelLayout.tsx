export function ThreePanelLayout({
  left,
  center,
  right,
}: {
  left: React.ReactNode;
  center: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="w-[33%] min-w-[360px] border-r border-panel-border">{left}</div>
      <div className="w-[40%] min-w-[420px] border-r border-panel-border">{center}</div>
      <div className="w-[27%] min-w-[320px]">{right}</div>
    </div>
  );
}

