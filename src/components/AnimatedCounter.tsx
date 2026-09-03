"use client";

import CountUp from "@/components/react-bits/CountUp";

interface Props {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export default function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 1400,
}: Props) {
  return <CountUp to={value} prefix={prefix} suffix={suffix} duration={duration / 1000} />;
}
