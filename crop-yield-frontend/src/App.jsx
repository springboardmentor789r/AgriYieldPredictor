import React from 'react'
import PredictForm from './components/PredictForm'


export default function App(){
return (
<div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
<div className="max-w-3xl w-full bg-white shadow-lg rounded-2xl p-8">
<header className="mb-6">
<h1 className="text-2xl font-semibold text-gray-800">Crop Yield Predictor</h1>
<p className="text-sm text-gray-500 mt-1">Enter environmental & crop details to estimate yield (tons/ha)</p>
</header>


<PredictForm />


<footer className="mt-6 text-xs text-gray-400">Powered by your trained Ridge pipeline (FastAPI backend)</footer>
</div>
</div>
)
}