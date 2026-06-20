import React, { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from "recharts";
import MiniTable from "../tables/MiniTable";

const data = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 },
];

const ResponsiveAreaChart = () => {
  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    const updateChartSize = () => {
      if (containerRef.current) {
        setChartWidth(containerRef.current.offsetWidth);
        setChartHeight(containerRef.current.offsetHeight);
      }
    };
    updateChartSize();
    window.addEventListener("resize", updateChartSize);

    return () => {
      window.removeEventListener("resize", updateChartSize);
    };
  }, []);

  const RADIAN = Math.PI / 180;

  const renderCustomizedLabel = (cx) => {
    const radius = cx.innerRadius + (cx.outerRadius - cx.innerRadius) * 0.5;
    const x = cx.cx + 15 + radius * Math.cos(-cx.midAngle * RADIAN);
    const y = cx.cy - 3 + radius * Math.sin(-cx.midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(cx.percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-10/12 h-fit flex flex-col gap-8" ref={containerRef}>
      <PieChart width={chartWidth} height={chartWidth}>
        <Pie
          data={data}
          cx={chartWidth / 2 - 5}
          innerRadius={chartWidth / 3}
          outerRadius={chartWidth / 2}
          fill="#8884d8"
          paddingAngle={2}
          dataKey="value"
          labelLine={false}
          label={renderCustomizedLabel}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </div>
  );
};

export default ResponsiveAreaChart;
