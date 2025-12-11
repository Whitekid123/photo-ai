import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight, Download, RefreshCw, Undo2, Image as ImageIcon, Wand2, X } from 'lucide-react';
import { ImageUploader } from './components/ImageUploader';
import { Button } from './components/Button';
import { editImageWithGemini } from './services/geminiService';
import { ImageAsset, ProcessingStatus } from './types';
import { PRESET_PROMPTS } from './constants';

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<ImageAsset | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [status, setStatus] = useState<ProcessingStatus>({ isProcessing: false });
  const [error, setError] = useState<string | null>(null);

  // Auto-resize textarea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [prompt]);

  const handleReset = () => {
    setSourceImage(null);
    setGeneratedImage(null);
    setPrompt("");
    setError(null);
  };

  const handleGenerate = async () => {
    if (!sourceImage || !prompt.trim()) return;

    setStatus({ isProcessing: true, message: "Initializing Gemini..." });
    setError(null);
    setGeneratedImage(null); // Clear previous result if re-generating

    try {
      setStatus({ isProcessing: true, message: "Thinking..." });
      
      const result = await editImageWithGemini(
        sourceImage.data,
        sourceImage.mimeType,
        prompt
      );

      if (result) {
        setGeneratedImage(result);
      } else {
        setError("The model processed the request but returned no image. Try a clearer prompt.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while communicating with Gemini.");
    } finally {
      setStatus({ isProcessing: false });
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `edited-product-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Product Photo AI
            </h1>
          </div>
          {sourceImage && (
            <Button variant="ghost" size="sm" onClick={handleReset} icon={<Undo2 className="w-4 h-4" />}>
              Start Over
            </Button>
          )}
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {!sourceImage ? (
          // Upload View
          <div className="max-w-2xl mx-auto flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center mb-10 space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                Transform your product photos <span className="text-indigo-600">instantly.</span>
              </h2>
              <p className="text-lg text-slate-600 max-w-lg mx-auto">
                Remove backgrounds, add professional lighting, or create new scenes with simple text instructions.
              </p>
            </div>
            <ImageUploader onImageSelected={setSourceImage} />
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
              {[
                { title: "Clean Up", desc: "Remove unwanted objects or backgrounds.", icon: <X className="w-5 h-5 text-red-500" /> },
                { title: "New Scene", desc: "Place your product in any environment.", icon: <ImageIcon className="w-5 h-5 text-blue-500" /> },
                { title: "Smart Edits", desc: "Change colors, materials, or lighting.", icon: <Wand2 className="w-5 h-5 text-purple-500" /> },
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                    {item.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // Editor View
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            
            {/* Left Column: Image Controls & Inputs */}
            <div className="flex flex-col space-y-6 order-2 lg:order-1">
              {/* Prompt Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  How should we edit this image?
                </label>
                <div className="relative">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g. Remove the background and place it on a marble table..."
                    className="w-full min-h-[100px] p-4 pr-12 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all text-base shadow-inner"
                    disabled={status.isProcessing}
                  />
                  <div className="absolute bottom-3 right-3 text-slate-400">
                    <Wand2 className="w-5 h-5" />
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="mt-4">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">Quick Actions</p>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_PROMPTS.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => setPrompt(p.prompt)}
                        disabled={status.isProcessing}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors border border-slate-200"
                      >
                        <span className="mr-1.5">{p.icon}</span>
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-xs text-slate-400">Powered by Gemini 2.5 Flash Image</p>
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || status.isProcessing}
                    isLoading={status.isProcessing}
                    size="lg"
                    className="w-full sm:w-auto shadow-indigo-200 shadow-lg"
                    icon={<Sparkles className="w-5 h-5" />}
                  >
                    {status.isProcessing ? 'Generating...' : 'Generate Edit'}
                  </Button>
                </div>
                
                {error && (
                  <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start">
                     <span className="mr-2 mt-0.5">⚠️</span> {error}
                  </div>
                )}
              </div>

              {/* Tips Section */}
              <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100">
                <h3 className="text-indigo-900 font-semibold mb-2 flex items-center">
                  <span className="bg-indigo-200 text-indigo-700 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2">i</span>
                  Pro Tips
                </h3>
                <ul className="text-sm text-indigo-800 space-y-2 list-disc list-inside ml-1">
                  <li>Be specific about lighting (e.g., "soft studio lighting").</li>
                  <li>Mention the material of surfaces (e.g., "wooden table", "glass podium").</li>
                  <li>Try "Remove background" as a standalone command first if you just want transparency (note: output is usually a white background or new scene).</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Visuals */}
            <div className="flex flex-col space-y-6 order-1 lg:order-2">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-2 overflow-hidden min-h-[400px] lg:h-[600px] flex flex-col">
                {/* Generated Result Container */}
                {generatedImage ? (
                   <div className="relative flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-100 rounded-2xl overflow-hidden group">
                     <img 
                       src={generatedImage} 
                       alt="Generated result" 
                       className="w-full h-full object-contain animate-in fade-in duration-700"
                     />
                     <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                       <Button variant="secondary" onClick={handleDownload} icon={<Download className="w-4 h-4" />}>
                         Download
                       </Button>
                     </div>
                     <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold shadow-sm text-indigo-600">
                       After
                     </div>
                   </div>
                ) : (
                  // Placeholder / Original View when no result yet
                  <div className="relative flex-1 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center">
                    {!status.isProcessing ? (
                      <div className="relative w-full h-full">
                         <img 
                           src={sourceImage.data} 
                           alt="Original source" 
                           className="w-full h-full object-contain"
                         />
                         <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-white">
                           Original
                         </div>
                      </div>
                    ) : (
                      <div className="text-center p-8">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                           <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
                           <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                           <div className="absolute inset-0 flex items-center justify-center">
                              <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                           </div>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">Creating Magic...</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto">{status.message}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Comparison Thumbnails (Only show if we have a result) */}
                {generatedImage && (
                  <div className="h-24 mt-2 flex space-x-2 overflow-x-auto p-1">
                    <button 
                      onClick={() => setGeneratedImage(null)} // Hacky way to 'view' original
                      className="relative h-full aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-indigo-500 transition-all flex-shrink-0"
                    >
                      <img src={sourceImage.data} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity" alt="Original" />
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1 rounded">Orig</span>
                    </button>
                    <button 
                      className="relative h-full aspect-square rounded-xl overflow-hidden border-2 border-indigo-600 flex-shrink-0"
                    >
                      <img src={generatedImage} className="w-full h-full object-cover" alt="Result" />
                      <span className="absolute bottom-1 left-1 text-[10px] bg-indigo-600 text-white px-1 rounded">New</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
};

export default App;