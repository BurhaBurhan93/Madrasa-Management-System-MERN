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
        <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Typography</h2>
          <p className="text-sm text-gray-600">Small text</p>
          <p className="text-base text-gray-700">Base text</p>
          <p className="text-lg text-gray-800">Large text</p>
          <p className="text-xl font-bold text-gray-900">Bold text</p>
        </div>

        {/* Test 3: Spacing */}
        <div className="bg-green-100 p-4 rounded-lg border border-green-300">
          <h2 className="text-lg font-semibold text-green-800 mb-2">Spacing</h2>
          <div className="space-y-2">
            <div className="h-2 bg-green-500 rounded"></div>
            <div className="h-4 bg-green-600 rounded"></div>
            <div className="h-6 bg-green-700 rounded"></div>
          </div>
        </div>

        {/* Test 4: Flexbox */}
        <div className="bg-purple-100 p-4 rounded-lg border border-purple-300">
          <h2 className="text-lg font-semibold text-purple-800 mb-2">Flexbox</h2>
          <div className="flex items-center justify-between">
            <div className="bg-purple-500 text-white p-2 rounded">Left</div>
            <div className="bg-purple-600 text-white p-2 rounded">Center</div>
            <div className="bg-purple-700 text-white p-2 rounded">Right</div>
          </div>
        </div>

        {/* Test 5: Grid */}
        <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Grid</h2>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-yellow-500 text-white p-2 rounded text-center">1</div>
            <div className="bg-yellow-600 text-white p-2 rounded text-center">2</div>
            <div className="bg-yellow-700 text-white p-2 rounded text-center">3</div>
          </div>
        </div>

        {/* Test 6: Shadows and Borders */}
        <div className="bg-red-100 p-4 rounded-lg border border-red-300">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Shadows & Borders</h2>
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-red-500 rounded shadow-sm"></div>
            <div className="w-10 h-10 bg-red-600 rounded shadow-md"></div>
            <div className="w-10 h-10 bg-red-700 rounded shadow-lg"></div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Interactive Elements</h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Button
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Outline
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Success
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-gray-600">
        <p>If you see properly styled elements above, Tailwind CSS is working correctly!</p>
      </div>
    </div>
  );
};

export default TailwindTest;