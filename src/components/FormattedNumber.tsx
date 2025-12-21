"use client";

import { useEffect, useState } from "react";

export function FormattedNumber({ value }: { value: number }) {
  const [formatted, setFormatted] = useState(value.toString());

  useEffect(() => {
    setFormatted(value.toLocaleString());
  }, [value]);

  return <span>{formatted}</span>;
}
