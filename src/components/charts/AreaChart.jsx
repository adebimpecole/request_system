import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { name: "Jan", amt: 1200 },
  { name: "Feb", amt: 2210 },
  { name: "Mar", amt: 2000 },
  { name: "April", amt: 1900 },
  { name: "May", amt: 1400 },
  { name: "June", amt: 2500 },
  { name: "July", amt: 2100 },
  { name: "Aug", amt: 800 },
  { name: "Sept", amt: 1 },
  { name: "Oct", amt: 1 },
  { name: "Nov", amt: 1 },
  { name: "Dec", amt: 1 },
];

const MyAreaChart = () => {
  const containerRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);

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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white/90 flex flex-col items-start p-4 border">
          <p className="uppercase font-semibold text-sm pb-2">{`${label}`}</p>
          <p className="text-sm">{`Amount : $${payload[0].value}`}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full h-full" ref={containerRef}>
      <LineChart
        width={chartWidth}
        height={chartHeight}
        data={data}
        margin={{
          top: 50,
          right: 0,
          left: -20,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" fontSize={13} />
        <YAxis fontSize={13} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="amt"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </div>
  );
};

export default MyAreaChart;
