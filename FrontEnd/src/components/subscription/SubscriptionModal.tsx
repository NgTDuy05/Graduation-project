'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  subscriptionService,
  SubscriptionPlan,
  UserSubscription,
  PlanType,
} from '../../services/subscription.service';
import {
  Crown,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  Loader2,
  X,
  Calendar,
} from 'lucide-react';

interface SubscriptionPanelProps {
  onUpdated?: (planType: PlanType) => void;
}

export const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({ onUpdated }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSub, setCurrentSub] = useState<UserSubscription | null>(null);
  const [history, setHistory] = useState<UserSubscription[]>([]);
  const [durationMonths, setDurationMonths] = useState<1 | 12>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [plansData, mySub] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getMySubscription(),
      ]);
      setPlans(plansData);
      setCurrentSub(mySub.current);
      setHistory(mySub.history);
    } catch {
      setFeedback({ type: 'error', text: 'Không thể tải thông tin gói tài khoản.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpgrade = async () => {
    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await subscriptionService.upgrade('PRO', durationMonths);
      setCurrentSub(res.subscription);
      setFeedback({ type: 'success', text: res.message });
      onUpdated?.('PRO');
      await loadData();
    } catch {
      setFeedback({ type: 'error', text: 'Nâng cấp gói thất bại. Vui lòng thử lại!' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Bạn có chắc muốn chuyển về gói Miễn phí (FREE)?')) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await subscriptionService.cancel();
      setCurrentSub(res.subscription);
      setFeedback({ type: 'success', text: res.message });
      onUpdated?.('FREE');
      await loadData();
    } catch {
      setFeedback({ type: 'error', text: 'Không thể chuyển gói. Vui lòng thử lại!' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-500">
        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        <span>Đang tải thông tin gói tài khoản...</span>
      </div>
    );
  }

  const isPro = currentSub?.planType === 'PRO';

  return (
    <div className="space-y-6">
      {/* Current Status Banner */}
      <div
        className={`rounded-3xl p-5 sm:p-6 border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isPro
            ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white border-amber-400 shadow-lg shadow-amber-500/20'
            : 'bg-slate-50 border-slate-200 text-slate-900'
        }`}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Crown className={`w-5 h-5 ${isPro ? 'text-yellow-200' : 'text-slate-500'}`} />
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">
              Gói hiện tại của bạn
            </span>
          </div>
          <h3 className="text-xl font-extrabold">
            {isPro ? 'Unilearn PRO ✨' : 'Unilearn Miễn phí (FREE)'}
          </h3>
          <p className={`text-xs ${isPro ? 'text-amber-100' : 'text-slate-500'}`}>
            {isPro && currentSub?.endDate
              ? `Hiệu lực đến: ${new Date(currentSub.endDate).toLocaleDateString('vi-VN')}`
              : 'Nâng cấp lên PRO để mở khóa không giới hạn Gia sư AI Gemini và đề thi nâng cao.'}
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="inline-flex items-center bg-white/90 text-slate-800 p-1 rounded-2xl border border-slate-200/80 text-xs font-bold self-start sm:self-center">
          <button
            type="button"
            onClick={() => setDurationMonths(1)}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              durationMonths === 1
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Theo tháng
          </button>
          <button
            type="button"
            onClick={() => setDurationMonths(12)}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 ${
              durationMonths === 12
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Theo năm</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700">
              -26%
            </span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border border-rose-200 text-rose-700'
          }`}
        >
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Plans Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {plans.map((plan) => {
          const isPlanPro = plan.planType === 'PRO';
          const isCurrent = currentSub?.planType === plan.planType;
          const displayPrice =
            durationMonths === 12 ? plan.priceYearly : plan.priceMonthly;

          return (
            <div
              key={plan.planType}
              className={`rounded-3xl p-6 border flex flex-col justify-between gap-6 transition-all ${
                isPlanPro
                  ? 'bg-white border-amber-300 ring-2 ring-amber-500/15 shadow-lg shadow-amber-500/5'
                  : 'bg-white border-slate-200/80 shadow-xs'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isPlanPro
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {plan.planType}
                  </span>
                  {isCurrent && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Đang sử dụng</span>
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-extrabold text-slate-900">{plan.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">
                    {displayPrice === 0
                      ? '0đ'
                      : `${displayPrice.toLocaleString('vi-VN')}đ`}
                  </span>
                  <span className="text-xs text-slate-500">
                    /{durationMonths === 12 ? 'năm' : 'tháng'}
                  </span>
                </div>

                <ul className="space-y-2.5 pt-2 border-t border-slate-100">
                  {plan.features.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-xs text-slate-700"
                    >
                      <CheckCircle2
                        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                          isPlanPro ? 'text-amber-500' : 'text-blue-600'
                        }`}
                      />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                {isPlanPro ? (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleUpgrade}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4 fill-white" />
                    )}
                    <span>
                      {isPro
                        ? `Gia hạn thêm ${durationMonths} tháng PRO`
                        : `Nâng cấp PRO (${durationMonths} tháng)`}
                    </span>
                  </button>
                ) : isPro ? (
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handleCancel}
                    className="w-full py-3 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-60"
                  >
                    Chuyển về gói FREE
                  </button>
                ) : (
                  <div className="w-full py-3 px-4 rounded-2xl bg-slate-100 text-slate-500 font-bold text-xs sm:text-sm text-center">
                    Gói mặc định hiện tại
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 space-y-3">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Lịch sử gói đăng ký</span>
          </h4>
          <div className="divide-y divide-slate-100 text-xs">
            {history.map((item) => (
              <div
                key={item.id}
                className="py-2.5 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                      item.planType === 'PRO'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.planType}
                  </span>
                  <span className="text-slate-600">
                    Từ {new Date(item.startDate).toLocaleDateString('vi-VN')}
                    {item.endDate
                      ? ` → ${new Date(item.endDate).toLocaleDateString('vi-VN')}`
                      : ' (Vô thời hạn)'}
                  </span>
                </div>
                <span
                  className={`font-semibold ${
                    item.isActive ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                >
                  {item.isActive ? 'Đang hoạt động' : 'Đã hết hạn / Đổi gói'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (planType: PlanType) => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onUpdated,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby="subscription-dialog-title"
      className="m-auto max-w-3xl w-[calc(100%-2rem)] rounded-3xl p-0 bg-white shadow-2xl border border-slate-200 overflow-hidden"
    >
      <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h1 id="subscription-dialog-title" className="font-extrabold text-base text-slate-900">
              Quản lý Gói Tài Khoản Unilearn
            </h1>
            <p className="text-xs text-slate-500">Nâng cấp trải nghiệm học tập thông minh</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng hộp thoại"
          className="w-8 h-8 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-500 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
        {isOpen && <SubscriptionPanel onUpdated={onUpdated} />}
      </div>
    </dialog>
  );
};

