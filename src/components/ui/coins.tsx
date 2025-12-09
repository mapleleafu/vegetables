interface CoinsProps {
  userCoins: number;
}

export function Coins({ userCoins }: CoinsProps) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[#3e3535] bg-[#937132] px-3 py-1 shadow-[0_0px_5px_7px_#422d2b25]">
      <span>🪙</span>
      <span className="text-xl">{userCoins}</span>
    </div>
  );
}
