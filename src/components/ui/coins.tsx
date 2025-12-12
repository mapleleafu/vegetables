interface CoinsProps {
  userCoins: number;
}

export function Coins({ userCoins }: CoinsProps) {
  return (
    <div className="bg-lightBrown flex items-center gap-2 rounded-2xl rounded-br-none rounded-bl-none border-[2.5px] border-b-0 border-[#3e3535] px-4 shadow-[0_0px_5px_7px_#422d2b25]">
      <span>🪙</span>
      <span className="text-xl">{userCoins}</span>
    </div>
  );
}
