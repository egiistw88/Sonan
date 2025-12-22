
export const speakStats = (
    orders: number, 
    targetOrders: number, 
    cashInHand: number,
    advice: string
) => {
    if (!('speechSynthesis' in window)) return;

    // Hentikan suara sebelumnya jika ada
    window.speechSynthesis.cancel();

    const remaining = targetOrders - orders;
    let text = `Laporan Sonan. `;
    text += `Posisi ${orders} order. `;
    
    if (remaining > 0) {
        text += `Kurang ${remaining} lagi. `;
    } else {
        text += `Target order tembus. `;
    }

    text += `Uang tunai ${Math.round(cashInHand / 1000)} ribu rupiah. `;
    text += `Semangat! ${advice}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
};
