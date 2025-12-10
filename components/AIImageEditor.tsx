import React, { useState, useRef } from 'react';
import { Upload, Wand2, Loader2, Download, RefreshCw } from 'lucide-react';
import { editProductImage } from '../services/geminiService';

interface AIImageEditorProps {
  onSave?: (imageUrl: string) => void;
}

export const AIImageEditor: React.FC<AIImageEditorProps> = ({ onSave }) => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setGeneratedImage(null); // Reset generated on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage || !prompt) return;

    setIsLoading(true);
    setError(null);

    try {
      // Extract base64 data and mime type
      const match = originalImage.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (!match) throw new Error("Invalid image format");

      const mimeType = match[1];
      const base64Data = match[2];

      const resultBase64 = await editProductImage(base64Data, mimeType, prompt);
      const resultImageUrl = `data:image/png;base64,${resultBase64}`;
      setGeneratedImage(resultImageUrl);
    } catch (err: any) {
      setError(err.message || "Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-purple-600" />
            Product Image Studio
           </h2>
           <p className="text-gray-500">Use Gemini 2.5 to edit product photos professionally.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="font-semibold text-gray-700 mb-4">1. Upload Original</h3>
            
            <div 
              className={`flex-1 min-h-[300px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden ${originalImage ? 'border-purple-200 bg-purple-50' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'}`}
              onClick={() => fileInputRef.current?.click()}
            >
               {originalImage ? (
                 <img src={originalImage} alt="Original" className="w-full h-full object-contain absolute inset-0 p-4" />
               ) : (
                 <div className="text-center p-6">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-gray-600 font-medium">Click to upload product image</p>
                    <p className="text-gray-400 text-sm mt-2">Supports JPG, PNG</p>
                 </div>
               )}
               <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
               />
            </div>

            {originalImage && (
              <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Editing Prompt</label>
                    <textarea 
                        className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none h-28"
                        placeholder="E.g., 'Place this bottle on a wooden table with soft sunlight', 'Remove the background', 'Add a neon glow effect'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                    ></textarea>
                  </div>
                  <button 
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
                    {isLoading ? 'Generating...' : 'Generate with Gemini'}
                  </button>
                  {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              </div>
            )}
        </div>

        {/* Output Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h3 className="font-semibold text-gray-700 mb-4">2. AI Result</h3>
            
            <div className="flex-1 min-h-[300px] bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center relative overflow-hidden">
                {isLoading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                        <p className="text-purple-600 font-medium animate-pulse">Designing your image...</p>
                    </div>
                )}
                
                {generatedImage ? (
                    <img src={generatedImage} alt="Generated" className="w-full h-full object-contain p-4" />
                ) : (
                    <div className="text-center text-gray-400">
                        <Wand2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>Result will appear here</p>
                    </div>
                )}
            </div>

            <div className="mt-6 flex gap-4">
                <button 
                    disabled={!generatedImage}
                    onClick={() => generatedImage && onSave && onSave(generatedImage)}
                    className="flex-1 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Use in Inventory
                </button>
                <a 
                    href={generatedImage || '#'}
                    download="gemini-edited-product.png"
                    className={`flex-1 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 ${!generatedImage ? 'pointer-events-none opacity-50' : ''}`}
                >
                    <Download className="w-4 h-4" />
                    Download
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};
