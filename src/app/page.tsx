import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Sidebar } from "@/components/Sidebar";
import { Section } from "@/components/Section";
import { Footer } from "@/components/Footer";
import { sections } from "@/content/optimization-guide";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      
      <div className="flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64 px-4 lg:px-8 py-8 max-w-4xl">
          {sections.map((section) => (
            <Section
              key={section.id}
              id={section.id}
              title={section.title}
              content={section.content}
            />
          ))}
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
