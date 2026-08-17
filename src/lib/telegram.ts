/**
 * Telegram sendMessage 공용 헬퍼.
 * TELEGRAM_BOT_TOKEN 미설정이거나 chatId가 없으면 조용히 무시(best-effort) —
 * 알림 실패가 상위 로직(공지 저장 등)을 막으면 안 되므로 절대 throw하지 않음.
 */
export async function sendTelegram(
  chatId: string | number | undefined | null,
  text: string,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
      }),
    });
  } catch {
    // best-effort; 실패해도 호출부 로직에 영향 없음
  }
}
