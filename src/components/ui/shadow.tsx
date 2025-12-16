interface ShadowProps {
  opacity?: string;
}

export default function Shadow({ opacity = "25" }: ShadowProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-999 rounded-xl rounded-b-none bg-[url('/static/shadow.png')] bg-cover bg-center bg-no-repeat"
      style={{ opacity: Number(opacity) / 100 }}
    />
  );
}
