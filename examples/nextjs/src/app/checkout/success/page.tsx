import { pkpayServer } from '@pkpayplus/nextjs/server';
import Link from 'next/link';
import {
  Frame,
  FramePanel,
  FrameHeader,
  FrameTitle,
  FrameDescription,
} from '@/components/ui/frame';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ArrowLeft, ShieldCheck, Clock, Receipt, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams;
  let verification = null;
  let errorMsg = null;

  if (session_id && process.env.PKPAY_SECRET_KEY && process.env.PKPAY_MERCHANT_ID) {
    try {
      verification = await pkpayServer.checkoutSessions.verify(session_id);
    } catch (err: unknown) {
      errorMsg = (err as Error)?.message || 'Failed to verify session status';
    }
  }

  const status = verification?.status || 'paid';
  const isPaid = status === 'paid';

  return (
    <div className="max-w-xl mx-auto py-16 px-4">
      <Frame className="w-full shadow-lg">
        {/* Header Hero Panel */}
        <FramePanel className="flex flex-col items-center text-center p-8 bg-gradient-to-b from-success/5 via-background to-background">
          <div className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center mb-4 ring-8 ring-success/5">
            <CheckCircle2 className="w-9 h-9" strokeWidth={2.2} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Payment Successful!
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Thank you! Your transaction has been securely processed and confirmed through PKPay+.
          </p>

          <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
            <ShieldCheck className="w-3.5 h-3.5 text-success" />
            <span>256-bit SSL Encrypted & Verified</span>
          </div>
        </FramePanel>

        {/* Transaction Summary Panel */}
        <FramePanel className="p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Transaction Details
              </span>
            </div>
            <Badge variant="success" size="sm" className="font-semibold uppercase text-[10px] tracking-wide">
              {status}
            </Badge>
          </div>

          <div className="divide-y divide-border/40 text-sm">
            {session_id && (
              <div className="flex items-start justify-between py-2.5 gap-4">
                <span className="text-muted-foreground flex items-center gap-1.5 shrink-0 text-xs sm:text-sm">
                  <Hash className="w-3.5 h-3.5 text-muted-foreground/60" />
                  Session ID
                </span>
                <span className="font-mono text-xs text-foreground/90 break-all text-right select-all bg-muted/40 px-2 py-0.5 rounded border border-border/40">
                  {session_id}
                </span>
              </div>
            )}

            {verification?.amount !== undefined && (
              <div className="flex items-center justify-between py-2.5">
                <span className="text-muted-foreground text-xs sm:text-sm">Amount Paid</span>
                <span className="font-bold text-foreground text-base">
                  {(verification.amount / 100).toFixed(2)} {verification.currency?.toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs sm:text-sm">
                <Clock className="w-3.5 h-3.5 text-muted-foreground/60" />
                Date & Time
              </span>
              <span className="text-foreground text-xs sm:text-sm">
                {verification?.paid_at
                  ? new Date(verification.paid_at).toLocaleString()
                  : new Date().toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-muted-foreground text-xs sm:text-sm">Payment Gateway</span>
              <span className="font-medium text-foreground text-xs sm:text-sm">PKPay+ Secure</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-700 dark:text-amber-300">
              Note: Live verification returned: {errorMsg}
            </div>
          )}
        </FramePanel>

        {/* Action Button Panel */}
        <FramePanel className="p-4 flex items-center justify-center bg-muted/20">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-primary text-primary-foreground font-medium text-sm transition-colors hover:bg-primary/90 shadow-xs cursor-pointer w-full sm:w-auto min-w-[200px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
        </FramePanel>
      </Frame>
    </div>
  );
}
