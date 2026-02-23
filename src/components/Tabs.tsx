"use client";

import { useState } from "react";
import { CodeBlock } from "./CodeBlock";
import { scenarioConfigs } from "@/content/optimization-guide";

export function ScenarioTabs() {
  const [activeTab, setActiveTab] = useState<keyof typeof scenarioConfigs>("gaming");

  const tabs = Object.entries(scenarioConfigs) as [keyof typeof scenarioConfigs, { name: string; code: string }][];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map(([key, config]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === key
                ? "bg-primary text-background"
                : "bg-surface text-text-muted hover:text-text hover:bg-surface/80"
            }`}
          >
            {config.name}
          </button>
        ))}
      </div>
      <CodeBlock code={scenarioConfigs[activeTab].code || ""} language="yaml" />
    </div>
  );
}
