"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileIcon, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { extractTextFromFile } from "@/lib/ocr";
import { analyzeMedicalBill } from "@/ai/flows/analyze-medical-bill";
import { analyzePrescription } from "@/ai/flows/analyze-prescription";
import { AnalysisResults } from "@/components/AnalysisResults";
import Image from "next/image";

type AppMode = "bill" | "prescription";

export default function HealthSensePage() {
  const [mode, setMode] = useState<AppMode>("bill");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      setResults(null);
      
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result as string);
        reader.readAsDataURL(selectedFile);
      } else if (selectedFile.type === "application/pdf") {
        setPreview(null); // Generic PDF icon handled in render
      }
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    setLoadingStep(null);
    setProgress(0);
  };

  const handleAnalysis = async () => {
    if (!file) return;

    try {
      setLoadingStep(mode === "bill" ? "Extracting text from bill..." : "Extracting medicine names...");
      setProgress(20);
      setResults(null);

      // 1. OCR Step
      const ocrResult = await extractTextFromFile(file);
      if (ocrResult.error) {
        throw new Error(ocrResult.error);
      }
      if (!ocrResult.text.trim()) {
        throw new Error("No readable text found in document. Please try a clearer image.");
      }

      setProgress(50);
      setLoadingStep(mode === "bill" ? "Analyzing for overcharges..." : "Checking medications...");

      // 2. AI Step
      let aiOutput;
      if (mode === "bill") {
        aiOutput = await analyzeMedicalBill({ ocrText: ocrResult.text });
      } else {
        aiOutput = await analyzePrescription({ prescriptionText: ocrResult.text });
      }

      setProgress(100);
      setResults(aiOutput);
      setLoadingStep(null);
    } catch (error: any) {
      console.error("Analysis error:", error);
      setLoadingStep(null);
      setProgress(0);
      toast({
        title: "Analysis Failed",
        description: error.message || "An unexpected error occurred during analysis.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-10 space-y-8">
      {/* Header & Mode Toggle */}
      <header className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <Sparkles className="text-white h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">HealthSense AI</h1>
        </div>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Intelligent medical document analysis. Understand your bills and medications better with professional-grade AI.
        </p>

        <div className="pt-4 flex justify-center">
          <Tabs value={mode} onValueChange={(val) => {
            setMode(val as AppMode);
            setResults(null);
          }} className="w-full max-w-xs">
            <TabsList className="grid grid-cols-2 bg-slate-100 p-1">
              <TabsTrigger value="bill" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Medical Bill</TabsTrigger>
              <TabsTrigger value="prescription" className="data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">Prescription</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="space-y-8">
        {/* Upload Area */}
        <section>
          {!file ? (
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
                ${isDragActive ? "border-accent bg-accent/5" : "border-slate-200 hover:border-primary/50 bg-white"}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                  <Upload className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-medium">Click to upload or drag & drop</p>
                  <p className="text-sm text-muted-foreground">Supported formats: JPG, PNG, PDF (Max 5MB)</p>
                </div>
              </div>
            </div>
          ) : (
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="h-16 w-16 bg-slate-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200 relative">
                      {preview ? (
                        <Image 
                          src={preview} 
                          alt="File preview" 
                          fill 
                          className="object-cover"
                          data-ai-hint="medical document"
                        />
                      ) : (
                        <FileIcon className="h-8 w-8 text-slate-400" />
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium truncate">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={clearFile}
                      className="text-slate-400 hover:text-destructive"
                      disabled={!!loadingStep}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {!results && !loadingStep && (
                  <div className="mt-6">
                    <Button 
                      onClick={handleAnalysis} 
                      className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-md group"
                    >
                      {mode === "bill" ? "Analyze Medical Bill" : "Analyze Prescription"}
                      <Sparkles className="ml-2 h-5 w-5 group-hover:animate-pulse" />
                    </Button>
                  </div>
                )}

                {loadingStep && (
                  <div className="mt-6 space-y-4 animate-in fade-in">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2 text-primary font-medium">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {loadingStep}
                      </span>
                      <span className="text-muted-foreground">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-slate-100" />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </section>

        {/* Results Panel */}
        <section id="results-panel">
          {results ? (
            <AnalysisResults mode={mode} data={results} />
          ) : !file ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
              <Sparkles className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">Upload a document to see AI analysis results</p>
            </div>
          ) : null}
        </section>
      </main>

      {/* Info Banner */}
      <footer className="pt-8 border-t">
        <div className="flex flex-col md:flex-row gap-6 md:gap-12">
          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">How it works</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              HealthSense AI uses high-precision Optical Character Recognition (OCR) to read your medical documents. 
              The text is then securely analyzed by Gemini AI to extract meaningful insights, identify potential billing errors, 
              or explain complex medications in simple terms.
            </p>
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="text-sm font-semibold text-primary uppercase tracking-wider">Privacy & Security</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We do not store your documents permanently. Analysis is performed in real-time, and files are discarded 
              immediately after processing. Always consult with a healthcare professional before making any medical or financial decisions.
            </p>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-8">
          © {new Date().getFullYear()} HealthSense AI. Built for the Hackathon. Use with discretion.
        </p>
      </footer>
    </div>
  );
}
