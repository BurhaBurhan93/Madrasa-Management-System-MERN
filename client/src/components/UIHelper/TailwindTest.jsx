const TailwindTest = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Tailwind CSS Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Test 1: Colors and Backgrounds */}
        <div className="bg-blue-100 p-4 rounded-lg border border-blue-300">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">Colors & Backgrounds</h2>
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-red-500 rounded"></div>
            <div className="w-8 h-8 bg-green-500 rounded"></div>
            <div className="w-8 h-8 bg-blue-500 rounded"></div>
            <div className="w-8 h-8 bg-yellow-500 rounded"></div>
          </div>
        </div>

        {/* Test 2: Typography */}
        <div className="p-4 rounded-lg border border-gray-300">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Typography</h2>
          <p className="text-sm text-gray-600">Small text</p>
          <p className="text-base text-gray-700">Base text</p>
          <p className="text-lg font-medium text-gray-800">Large bold text</p>
        </div>

        {/* Test 3: Spacing */}
        <div className="p-4 rounded-lg border border-gray-300 space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">Spacing</h2>
          <div className="bg-gray-200 p-2">Padding: p-2</div>
          <div className="bg-gray-300 m-2">Margin: m-2</div>
        </div>

        {/* Test 4: Flexbox/Grid */}
        <div className="p-4 rounded-lg border border-gray-300">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Flexbox</h2>
          <div className="flex space-x-2">
            <div className="bg-blue-200 p-2">Item 1</div>
            <div className="bg-green-200 p-2">Item 2</div>
          </div>
        </div>

        {/* Test 5: Shadows/Borders */}
        <div className="p-4 rounded-lg border-2 border-dashed border-gray-400">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Borders</h2>
          <div className="shadow-md p-3 bg-white rounded">Box with shadow</div>
        </div>

        {/* Test 6: Responsive */}
        <div className="p-4 rounded-lg border border-gray-300">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Responsive</h2>
          <div className="bg-purple-200 p-2 hidden md:block lg:hidden">
            Visible on medium screens
          </div>
          <div className="bg-pink-200 p-2 lg:block hidden">
            Visible on large screens
          </div>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;