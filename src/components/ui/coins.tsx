interface CoinsProps {
  userCoins: number;
}

export function Coins({ userCoins }: CoinsProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-amber-400 px-3 py-1">
      <span>🪙</span>
      <span className="font-mono">{userCoins}</span>
    </div>
  );
}
