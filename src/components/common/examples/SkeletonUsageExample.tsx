import { useState } from "react";
import { 
  RequestDetailsSkeleton, 
  SideMenuProgressSkeleton, 
  ProjectInfoWithProgressSkeleton,
  ProjectDetailsPageSkeleton 
} from "../skeletons";

const SkeletonUsageExample = () => {
  const [activeDemo, setActiveDemo] = useState<string>("");

  const demoButtons = [
    { key: "request-details", label: "Request Details with Progress (Exact Match)" },
    { key: "project-details", label: "Project Details Page (With Sidebar)" },
    { key: "project-info", label: "Project Info with Progress" },
    { key: "side-menu-only", label: "Side Menu Progress Only" },
  ];

  const renderSkeleton = () => {
    switch (activeDemo) {
      case "request-details":
        return <RequestDetailsSkeleton />;
      case "project-details":
        return <ProjectDetailsPageSkeleton />;
      case "project-info":
        return <ProjectInfoWithProgressSkeleton />;
      case "side-menu-only":
        return (
          <div className="fixed inset-0 z-100 bg-white">
            <div className="min-h-screen flex">
              <SideMenuProgressSkeleton 
                width="w-80" 
                stepsCount={5} 
                showAdditionalCards={true}
              />
              <div className="flex-1 bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500 text-center">
                  <div className="text-2xl mb-2">🚀</div>
                  <div>Main content would go here</div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (activeDemo) {
    return (
      <>
        {renderSkeleton()}
        {/* Close button */}
        <button
          onClick={() => setActiveDemo("")}
          className="fixed top-4 right-4 z-[101] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors"
        >
          Close Demo
        </button>
      </>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Skeleton Loading Examples</h1>
      
      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          Click on any button below to see different skeleton loading states in action:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demoButtons.map((demo) => (
            <button
              key={demo.key}
              onClick={() => setActiveDemo(demo.key)}
              className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
            >
              <h3 className="font-semibold text-gray-800 mb-2">{demo.label}</h3>
              <p className="text-sm text-gray-600">
                Preview the skeleton loading state for {demo.label.toLowerCase()}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Usage Instructions</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">1. Full-Page Request Details Skeleton (EXACT MATCH):</h3>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {`import { RequestDetailsSkeleton } from './components/common/skeletons';`}
            </code>
            <p className="text-xs text-gray-600 mt-1">✅ Includes header, sidebar progress, and main content - matches your exact layout!</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">2. Request Progress Sidebar Only:</h3>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {`import { RequestProgressSkeleton } from './components/common/skeletons';`}
            </code>
            <p className="text-xs text-gray-600 mt-1">✅ Just the progress sidebar component with shimmer effects</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">3. Project Details with Sidebar:</h3>
            <code className="bg-gray-100 px-2 py-1 rounded text-sm">
              {`import { ProjectDetailsPageSkeleton } from './components/common/skeletons';`}
            </code>
            <p className="text-xs text-gray-600 mt-1">✅ For project details pages with info cards</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Features:</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Shimmer animations using your existing CSS animations</li>
            <li>Responsive design that works on all screen sizes</li>
            <li>Customizable progress sidebar with adjustable steps and width</li>
            <li>Matches your existing design system colors and spacing</li>
            <li>Prevents user interaction during loading with body overflow/pointer-events control</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SkeletonUsageExample;
