const RESEND_API_KEY = process.env.RESEND_API_KEY

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!RESEND_API_KEY) {
    console.log('Email skipped (no RESEND_API_KEY):', { to, subject })
    return
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'AuraRank <noreply@aurarank.io>',
      to,
      subject,
      html,
    }),
  })
}

export function scanCompleteEmail(brandName: string, score: number, mentions: number, opportunities: number) {
  const scoreColor = score >= 60 ? '#10b981' : score >= 30 ? '#f59e0b' : '#ef4444'
  return {
    subject: `AuraRank: ${brandName} scored ${score}/100 in AI visibility`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 32px; border-radius: 12px;">
        <h1 style="color: #818cf8; font-size: 20px; margin-bottom: 24px;">AuraRank Scan Complete</h1>
        <p style="margin-bottom: 16px;">Your AI visibility scan for <strong style="color: white;">${brandName}</strong> is complete.</p>
        <div style="background: #1e293b; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 16px;">
          <p style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">AI VISIBILITY SCORE</p>
          <p style="font-size: 48px; font-weight: bold; color: ${scoreColor}; margin: 0;">${score}</p>
          <p style="font-size: 12px; color: #64748b;">out of 100</p>
        </div>
        <div style="display: flex; gap: 12px; margin-bottom: 20px;">
          <div style="flex: 1; background: #1e293b; border-radius: 8px; padding: 12px; text-align: center;">
            <p style="font-size: 11px; color: #94a3b8;">Mentions</p>
            <p style="font-size: 24px; font-weight: bold; color: white;">${mentions}</p>
          </div>
          <div style="flex: 1; background: #1e293b; border-radius: 8px; padding: 12px; text-align: center;">
            <p style="font-size: 11px; color: #94a3b8;">Opportunities</p>
            <p style="font-size: 24px; font-weight: bold; color: #10b981;">${opportunities}</p>
          </div>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: block; background: #6366f1; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; text-align: center; font-size: 14px;">View Full Report</a>
        <p style="font-size: 11px; color: #475569; margin-top: 20px; text-align: center;">AuraRank - AI Visibility Intelligence</p>
      </div>
    `,
  }
}
