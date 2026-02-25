"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileText, Stethoscope, AlertTriangle, CheckCircle2, IndianRupee, Pill, Info, HelpCircle } from "lucide-react";
import type { AnalyzeMedicalBillOutput } from "@/ai/flows/analyze-medical-bill";
import type { AnalyzePrescriptionOutput } from "@/ai/flows/analyze-prescription";
import { cn } from "@/lib/utils";

interface AnalysisResultsProps {
  mode: "bill" | "prescription";
  data: AnalyzeMedicalBillOutput | AnalyzePrescriptionOutput | null;
}

export function AnalysisResults({ mode, data }: AnalysisResultsProps) {
  if (!data) return null;

  if (mode === "bill") {
    const billData = data as AnalyzeMedicalBillOutput;
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <Card className="border-primary/10 shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 pb-4">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-xl">Bill Analysis Summary</CardTitle>
            </div>
            <CardDescription>Comprehensive review of all charges based on Indian market fair rates</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-accent/10 p-4 rounded-lg mb-6">
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground">Total Possible Savings</p>
                <p className="text-3xl font-bold text-primary flex items-center justify-center md:justify-start">
                  <IndianRupee className="h-6 w-6" />
                  {(billData.totalPossibleSavings ?? 0).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                <CheckCircle2 className="h-4 w-4 text-accent" />
                Items marked as 'Overcharged' are the primary targets for negotiation.
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Detailed Breakdown
              </h3>
              <div className="grid gap-3">
                {billData.items && billData.items.length > 0 ? (
                  billData.items.map((item, idx) => {
                    const isOverpriced = item.status === 'overpriced';
                    const isFair = item.status === 'fair' || item.status === 'undercharged';
                    
                    return (
                      <div 
                        key={idx} 
                        className={cn(
                          "border rounded-lg p-4 bg-white shadow-sm transition-colors",
                          isOverpriced ? "border-red-200 bg-red-50/30" : isFair ? "border-green-100 bg-green-50/20" : "border-slate-200"
                        )}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-foreground">{item.item}</span>
                          <Badge 
                            variant={isOverpriced ? "destructive" : isFair ? "secondary" : "outline"}
                            className={cn(
                              "ml-2",
                              isFair && "bg-green-100 text-green-700 hover:bg-green-200 border-transparent",
                              item.status === 'unknown' && "bg-amber-50 text-amber-700 border-amber-200"
                            )}
                          >
                            {item.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <p className="text-muted-foreground">Billed Price</p>
                            <p className="font-semibold">₹{(item.billedPrice ?? 0).toFixed(2)}</p>
                          </div>
                          {item.status !== 'unknown' && (
                            <div>
                              <p className="text-muted-foreground">Fair Estimate</p>
                              <p className={cn(
                                "font-semibold",
                                isOverpriced ? "text-red-600" : "text-green-600"
                              )}>
                                ₹{(item.fairPriceEstimate ?? 0).toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 items-start text-sm text-muted-foreground bg-white/50 p-2 rounded border-l-2 border-slate-300">
                          {isOverpriced ? <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" /> : 
                           isFair ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" /> :
                           <HelpCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />}
                          <p>{item.recommendation}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground italic">No billing items detected.</p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" />
                General Recommendations
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                {billData.generalRecommendations && billData.generalRecommendations.length > 0 ? (
                  billData.generalRecommendations.map((rec, idx) => (
                    <li key={idx}>{rec}</li>
                  ))
                ) : (
                  <li className="italic">Standard billing review recommended.</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const prescriptionData = data as AnalyzePrescriptionOutput;
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-primary/10 shadow-sm overflow-hidden">
        <CardHeader className="bg-primary/5 pb-4">
          <div className="flex items-center gap-2 text-primary">
            <Stethoscope className="h-5 w-5" />
            <CardTitle className="text-xl">Prescription Analysis</CardTitle>
          </div>
          <CardDescription>Details for identified medications in your prescription</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {prescriptionData.medicines && prescriptionData.medicines.length > 0 ? (
            prescriptionData.medicines.map((med, idx) => (
              <div key={idx} className="group border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-slate-50 p-4 border-b flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg text-primary">{med.name}</h3>
                  </div>
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{med.treats}</Badge>
                </div>
                <div className="p-4 grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">Common Side Effects</h4>
                      <div className="flex flex-wrap gap-1">
                        {med.sideEffects && med.sideEffects.length > 0 ? med.sideEffects.map((effect, i) => (
                          <Badge key={i} variant="outline" className="text-xs font-normal border-slate-200">{effect}</Badge>
                        )) : <span className="text-xs text-muted-foreground">None listed</span>}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-2">Drug Interactions</h4>
                      <ul className="text-xs space-y-1 list-disc list-inside text-muted-foreground">
                        {med.drugInteractions && med.drugInteractions.length > 0 ? med.drugInteractions.map((item, i) => (
                          <li key={i}>{item}</li>
                        )) : <li>No major interactions identified</li>}
                      </ul>
                    </div>
                  </div>
                  <div className="bg-amber-50/50 p-3 rounded-md border border-amber-100">
                    <h4 className="text-sm font-semibold text-amber-900 flex items-center gap-1 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      Important Cautions
                    </h4>
                    <ul className="text-xs space-y-2 text-amber-800">
                      {med.cautions && med.cautions.length > 0 ? med.cautions.map((caution, i) => (
                        <li key={i} className="leading-relaxed">• {caution}</li>
                      )) : <li className="italic">Standard precautions apply.</li>}
                    </ul>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground italic border-2 border-dashed rounded-lg">
              No medications were clearly identified from the provided text.
            </div>
          )}
        </CardContent>
      </Card>
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-muted-foreground flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
        <p>
          <strong>Disclaimer:</strong> This analysis is generated by AI and is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition or medication.
        </p>
      </div>
    </div>
  );
}
