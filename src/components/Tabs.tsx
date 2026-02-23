"use client";

import { useState } from "react";
import { CodeBlock } from "./CodeBlock";
import { scenarioConfigs } from "@/content/optimization-guide";

export function ScenarioTabs() {
  const [activeTab, setActiveTab] = useState<keyof typeof scenarioConfigs>("gaming");

  const tabs = Object.entries(scenarioConfigs) as [keyof typeof scenarioConfigs, { name: string; code?: string; clientCode?: string; serverCode?: string; notes?: string }][];
  const currentConfig = scenarioConfigs[activeTab];

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
      
      {"clientCode" in currentConfig && currentConfig.clientCode ? (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-text-muted mb-2">Client Configuration</h4>
            <CodeBlock code={currentConfig.clientCode} language="yaml" />
          </div>
          {"serverCode" in currentConfig && currentConfig.serverCode && (
            <div>
              <h4 className="text-sm font-medium text-text-muted mb-2">Server Configuration</h4>
              <CodeBlock code={currentConfig.serverCode} language="yaml" />
            </div>
          )}
          {"notes" in currentConfig && currentConfig.notes && (
            <div className="p-4 bg-surface rounded-lg border border-border">
              <pre className="text-sm text-text-muted whitespace-pre-wrap">{currentConfig.notes}</pre>
            </div>
          )}
        </div>
      ) : (
        "code" in currentConfig && currentConfig.code && <CodeBlock code={currentConfig.code} language="yaml" />
      )}
    </div>
  );
}
