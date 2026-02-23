import { ContentBlock } from "@/content/optimization-guide";
import { CodeBlock } from "./CodeBlock";
import { ConfigTable } from "./ConfigTable";
import { ScenarioTabs } from "./Tabs";

interface SectionProps {
  id: string;
  title: string;
  content: ContentBlock[];
}

function renderContent(block: ContentBlock, index: number) {
  switch (block.type) {
    case "heading":
      const HeadingTag = `h${block.level || 3}` as keyof JSX.IntrinsicElements;
      const headingClasses = {
        3: "text-xl font-semibold text-text mt-8 mb-4",
        4: "text-lg font-medium text-text mt-6 mb-3",
      };
      return (
        <HeadingTag
          key={index}
          className={headingClasses[block.level as 3 | 4] || headingClasses[3]}
        >
          {block.text}
        </HeadingTag>
      );

    case "paragraph":
      return (
        <p
          key={index}
          className="text-text-muted leading-relaxed mb-4"
          dangerouslySetInnerHTML={{
            __html: block.text?.replace(
              /\*\*(.*?)\*\*/g,
              '<strong class="text-text">$1</strong>'
            ) || "",
          }}
        />
      );

    case "code":
      return (
        <div key={index} className="my-4">
          <CodeBlock code={block.code || ""} language={block.language} />
        </div>
      );

    case "table":
      return (
        <div key={index} className="my-4">
          <ConfigTable headers={block.headers || []} rows={block.rows || []} />
        </div>
      );

    case "list":
      return (
        <ul key={index} className="list-disc list-inside space-y-2 mb-4 text-text-muted">
          {block.items?.map((item, i) => (
            <li
              key={i}
              dangerouslySetInnerHTML={{
                __html: item.replace(
                  /\*\*(.*?)\*\*/g,
                  '<strong class="text-text">$1</strong>'
                ),
              }}
            />
          ))}
        </ul>
      );

    case "diagram":
      return (
        <div key={index} className="my-6 p-4 bg-surface rounded-lg border border-border overflow-x-auto">
          <pre className="text-sm font-mono text-primary whitespace-pre">{block.text}</pre>
        </div>
      );

    default:
      return null;
  }
}

export function Section({ id, title, content }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-2xl font-bold text-text mb-6 pb-2 border-b border-border">
        {title}
      </h2>
      {id === "scenario-configurations" ? (
        <ScenarioTabs />
      ) : (
        content.map((block, index) => renderContent(block, index))
      )}
    </section>
  );
}
