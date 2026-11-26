'use client';

import React from 'react';
import { StudentLayout } from '../../../components/layout/StudentLayout';
import { SubscriptionPanel } from '../../../components/subscription/SubscriptionModal';

export default function StudentSubscriptionPage() {
  return (
    <StudentLayout pageTitle="Gói tài khoản Unilearn">
      <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <SubscriptionPanel />
      </div>
    </StudentLayout>
  );
}

