import React from "react";
import { useLoading } from "../../context/LoaderProvider";

/**
 * Example component showing how to use the SmartSkeletonLoader with different variants
 * 
 * Usage:
 * 1. Import and use useLoading hook
 * 2. Set loading state with setLoading(true)
 * 3. Set appropriate variant or use "auto" for route-based detection
 * 4. The skeleton loader will automatically appear when loading is true
 * 
 * Variants:
 * - "auto": Automatically detects the right skeleton based on current route (RECOMMENDED)
 * - "page": Full page skeleton with header, sidebar, and card grid
 * - "card": Modal-style skeleton for forms and cards
 * - "table": Table-style skeleton with header and rows
 * - "dashboard": Dashboard-style skeleton with stats cards and charts
 * 
 * Auto-detection covers:
 * - Request List (/requests) - Custom table skeleton
 * - Contract List (/contract) - Custom table skeleton with search/filter
 * - Project Details (/project-details/*) - Custom details skeleton
 * - Contract Details (/contract-details/*) - Reuses details skeleton
 * - Request Details (/request-details/*) - Reuses details skeleton
 * - Edit/Create forms - Card variant
 * - Dashboard pages - Dashboard variant
 * - Other table pages - Table variant
 */

const SkeletonLoaderExample: React.FC = () => {
  const { setLoading, setVariant } = useLoading();

  const handleShowSkeleton = (variant: "auto" | "page" | "card" | "table" | "dashboard") => {
    setVariant(variant);
    setLoading(true);
    
    // Simulate loading time
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Skeleton Loader Examples</h2>
      
      <div className="mb-4">
        <button
          onClick={() => handleShowSkeleton("auto")}
          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
        >
          🤖 Auto Detect (Recommended)
        </button>
        <p className="text-sm text-gray-600 mt-2">
          Automatically chooses the best skeleton based on your current page
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => handleShowSkeleton("page")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Page Skeleton
        </button>
        
        <button
          onClick={() => handleShowSkeleton("card")}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Card Skeleton
        </button>
        
        <button
          onClick={() => handleShowSkeleton("table")}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          Table Skeleton
        </button>
        
        <button
          onClick={() => handleShowSkeleton("dashboard")}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
        >
          Dashboard Skeleton
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-2">How to Use:</h3>
        <pre className="text-sm text-gray-600 overflow-x-auto">
{`import { useLoading } from "../../context/LoaderProvider";

const MyComponent = () => {
  const { setLoading, setVariant } = useLoading();
  
  const handleAsyncOperation = async () => {
    setVariant("table"); // Choose appropriate variant
    setLoading(true);
    
    try {
      await fetchData();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button onClick={handleAsyncOperation}>
      Load Data
    </button>
  );
};`}
        </pre>
      </div>
    </div>
  );
};

export default SkeletonLoaderExample;
