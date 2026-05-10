"use client";

import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";

interface ATSChartProps {
  overallScore: number;
  atsScore: number;
  jobMatchPercentage: number;
  detectedSkillsCount: number;
  missingSkillsCount: number;
}

export function ATSChart({
  overallScore,
  atsScore,
  jobMatchPercentage,
  detectedSkillsCount,
  missingSkillsCount,
}: ATSChartProps) {
  const skillCoverage = Math.round(
    (detectedSkillsCount / Math.max(detectedSkillsCount + missingSkillsCount, 1)) * 100
  );

  const data = [
    { metric: "Overall", value: overallScore },
    { metric: "ATS Score", value: atsScore },
    { metric: "Job Match", value: jobMatchPercentage },
    { metric: "Skills", value: skillCoverage },
    { metric: "Content", value: Math.round((overallScore + atsScore) / 2) },
  ];

  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Performance Radar</h3>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.05)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
          />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#a855f7"
            fill="#a855f7"
            fillOpacity={0.15}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(15,15,30,0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#e2e8f0",
            }}
            formatter={(value) => [`${value}%`, "Score"]}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
