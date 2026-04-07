"use client";

import React from "react";

export const FEEDBACK_EMAIL = "cyibin06@gmail.com";

interface CopyEmailButtonProps {
  defaultLabel: string;
  copiedLabel?: string;
  className?: string;
}

export function CopyEmailButton({
  defaultLabel,
  copiedLabel = "邮箱已复制",
  className,
}: CopyEmailButtonProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCopied(false);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(FEEDBACK_EMAIL);
      setCopied(true);
    } catch {
      window.prompt("复制这个邮箱地址", FEEDBACK_EMAIL);
    }
  }

  return (
    <button type="button" className={className} onClick={handleCopy}>
      {copied ? copiedLabel : defaultLabel}
    </button>
  );
}
