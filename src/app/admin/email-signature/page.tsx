"use client";

import React from "react";
import { getFreshAccessToken } from "@/lib/auth-token";
import { EMAIL_SIGNATURE_MAX_LENGTH } from "@/lib/email-signature";
import { useAdminPageHeader } from "@/context/admin-page-header-context";

export default function EmailSignaturePage() {
  const { setTitle } = useAdminPageHeader();
  const [sigLoading, setSigLoading] = React.useState(true);
  const [sigSubmitting, setSigSubmitting] = React.useState(false);
  const sigSubmittingRef = React.useRef(false);
  const sigFetchSeqRef = React.useRef(0);
  const [sigValue, setSigValue] = React.useState("");
  const [sigError, setSigError] = React.useState<string | null>(null);
  const [sigSuccess, setSigSuccess] = React.useState(false);

  const fetchSignature = async () => {
    const seq = ++sigFetchSeqRef.current;
    try {
      const token = await getFreshAccessToken();
      if (sigFetchSeqRef.current !== seq) return;
      if (!token) {
        setSigError("登录状态异常，请重新登录");
        setSigLoading(false);
        return;
      }
      const res = await fetch("/api/admin/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json().catch(() => ({}));
      if (sigFetchSeqRef.current !== seq) return;
      if (!res.ok) throw new Error(result.error || "加载失败");
      setSigValue(result.value ?? "");
      setSigLoading(false);
    } catch (err) {
      if (sigFetchSeqRef.current !== seq) return;
      setSigError(err instanceof Error ? err.message : "加载失败，请重试");
      setSigLoading(false);
    }
  };

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSignature();
  }, []);

  React.useEffect(() => {
    setTitle("邮件签名");
  }, [setTitle]);

  const handleSaveSignature = async (): Promise<boolean> => {
    if (sigSubmittingRef.current || sigSubmitting) return false;
    sigSubmittingRef.current = true;
    setSigSubmitting(true);
    setSigError(null);
    setSigSuccess(false);
    try {
      const token = await getFreshAccessToken();
      if (!token) {
        setSigError("登录状态异常，请重新登录");
        return false;
      }
      const trimmed = sigValue.trim();
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value: trimmed }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.error || "保存失败，请重试");
      setSigValue(trimmed);
      setSigSuccess(true);
      return true;
    } catch (err) {
      setSigError(err instanceof Error ? err.message : "保存失败，请重试");
      return false;
    } finally {
      sigSubmittingRef.current = false;
      setSigSubmitting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col space-y-4">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="mt-4 space-y-3 pb-safe">
          <p className="text-xs text-text-muted">排练通知邮件底部的落款签名</p>

          {sigLoading ? (
            <p className="py-6 text-center text-xs text-text-muted">加载中…</p>
          ) : sigError && sigValue === "" ? (
            <div className="py-4 text-center">
              <p className="text-xs text-danger">加载失败：{sigError}</p>
              <button
                type="button"
                onClick={() => void fetchSignature()}
                className="mt-3 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-text-muted hover:bg-muted"
              >
                重试
              </button>
            </div>
          ) : (
            <>
              <textarea
                value={sigValue}
                onChange={(e) => {
                  setSigValue(e.target.value);
                  setSigSuccess(false);
                }}
                rows={9}
                maxLength={EMAIL_SIGNATURE_MAX_LENGTH}
                disabled={sigSubmitting}
                className="w-full resize-none rounded-xl border border-border bg-muted px-3 py-3 text-xs leading-[1.6] text-text outline-none focus:border-text-muted"
                placeholder="如：北京大学交响乐团管理团队"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-text-muted">支持多行换行</p>
                <p className="text-xs text-text-muted">
                  {sigValue.length}/{EMAIL_SIGNATURE_MAX_LENGTH}
                </p>
              </div>
              {!sigValue.trim() && (
                <p className="text-xs text-text-muted">未设置时邮件将使用默认签名</p>
              )}
              {sigSuccess && <p className="text-xs text-success">签名已保存</p>}
              {sigError && <p className="text-xs text-danger">{sigError}</p>}
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={sigSubmitting}
                  onClick={() => fetchSignature()}
                  className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-text-muted hover:bg-muted disabled:opacity-60"
                >
                  重置
                </button>
                <button
                  type="button"
                  disabled={sigSubmitting}
                  onClick={() => void handleSaveSignature()}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
                >
                  {sigSubmitting ? "保存中…" : "保存"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
