import Link from 'next/link';
import {
  Frame,
  FramePanel,
} from '@/components/ui/frame';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export default function CheckoutCancelPage() {
  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <Frame className="w-full shadow-lg">
        {/* Header Panel */}
        <FramePanel className="flex flex-col items-center text-center p-8 bg-gradient-to-b from-destructive/5 via-background to-background">
          <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4 ring-8 ring-destructive/5">
            <XCircle className="w-9 h-9" strokeWidth={2.2} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Checkout Cancelled
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Your transaction was cancelled and no charges were made to your account.
          </p>
        </FramePanel>

        {/* Info & Assistance Panel */}
        <FramePanel className="p-6 space-y-3 text-sm text-muted-foreground">
          <p className="leading-relaxed">
            If you experienced an issue during checkout or changed your mind, you can try again anytime or choose a different payment method.
          </p>
          <div className="p-3 bg-muted/50 rounded-lg border border-border/50 text-xs">
            <span className="font-semibold text-foreground">Need help?</span> If you believe this was an error, please contact customer support or try refreshing your cart.
          </div>
        </FramePanel>

        {/* Action Panel */}
        <FramePanel className="p-4 flex flex-col sm:flex-row items-center justify-center gap-3 bg-muted/20">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-9 px-5 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-colors hover:bg-primary/90 shadow-xs cursor-pointer w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-9 px-5 rounded-lg border border-border bg-background text-foreground font-medium text-sm transition-colors hover:bg-muted/80 cursor-pointer w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
        </FramePanel>
      </Frame>
    </div>
  );
}
