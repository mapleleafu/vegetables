"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Coins } from "@/components/ui/coins";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { CheckCircle2, XCircle, Trophy } from "lucide-react";

interface CategoryCompleteProps {
  correct: number;
  wrong: number;
  coinsEarned: number;
}

export function CategoryComplete({
  correct,
  wrong,
  coinsEarned,
}: CategoryCompleteProps) {
  const router = useRouter();

  const data = [
    { name: "Correct", value: correct, color: "oklch(79.2% 0.209 151.711)" },
    { name: "Incorrect", value: wrong, color: "oklch(70.4% 0.191 22.216)" },
  ];

  return (
    <div className="animate-in fade-in zoom-in flex flex-1 flex-col items-center justify-center duration-300">
      <div className="border-darkBrown w-full max-w-md rounded-2xl border-[2.5px] bg-[#ccb17c] p-6 shadow-[0_0px_55px_25px_#00000040]">
        <div className="mb-6 text-center">
          <Trophy className="mx-auto mb-2 h-16 w-16 text-yellow-600 drop-shadow-md" />
          <h2 className="text-3xl font-bold text-darkBrown">
            Category Complete!
          </h2>
          <p className="font-medium text-[#5a3e3b]">Here is how you did</p>
        </div>

        <div className="mb-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#fff8e1",
                  borderRadius: "8px",
                  border: "1px solid #8b4513",
                }}
                itemStyle={{ color: "#422d2b" }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center rounded-xl border border-green-200 bg-green-100/50 p-3">
            <span className="text-lg font-bold text-green-700">{correct}</span>
            <span className="flex items-center gap-1 text-sm text-green-800">
              <CheckCircle2 size={14} /> Correct
            </span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-red-200 bg-red-100/50 p-3">
            <span className="text-lg font-bold text-red-700">{wrong}</span>
            <span className="flex items-center gap-1 text-sm text-red-800">
              <XCircle size={14} /> Incorrect
            </span>
          </div>
        </div>

        {coinsEarned > 0 && (
          <div className="mb-8 flex items-center justify-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-400/20 p-4">
            <Coins userCoins={coinsEarned} />
            <span className="font-bold text-yellow-900">
              Earned this session!
            </span>
          </div>
        )}

        <Button
          size="lg"
          className="bg-gabs w-full p-7 text-xl font-bold hover:bg-black/10"
          onClick={() => router.push("/categories")}
        >
          Back to Categories
        </Button>
      </div>
    </div>
  );
}
