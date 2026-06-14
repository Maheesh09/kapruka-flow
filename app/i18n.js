// app/i18n.js
// Hand-written UI strings for all three modes. These are the FIXED chrome of the
// app (buttons, labels, headings) — NOT agent dialogue (the model speaks those).
//
// ⚠️ The SI and TG values below are a solid first draft. Have a native Sinhala
// speaker review them — register and warmth matter more than literal accuracy.
// Lines marked  // review  are the ones most worth a second pair of eyes.

export const STRINGS = {
  EN: {
    // ── Splash ──
    tagline: 'Your shopping companion',
    // ── Header journey nodes (order matters: index 0–4) ──
    journey: ['Goal', 'Discover', 'Plan', 'Delivery', 'Done'],
    // ── Opening canvas ──
    openingHeadline: 'What would you like Flow to handle today?',
    openingSub: 'Flow your way to the perfect find',
    inputPlaceholderOpening: 'Tell me what you need…',
    // ── Opening chips: label + the goal text sent to the agent ──
    chipGiftLabel: 'Send a gift',
    chipGiftGoal: 'I want to send a gift',
    chipCelebrateLabel: 'Celebrate',
    chipCelebrateGoal: 'I need a birthday cake delivered to Kandy this Saturday, budget under LKR 6,000',
    chipSayLabel: 'Say it',
    chipSayGoal: 'I want to send flowers and chocolates to say thank you, delivery to Colombo tomorrow',
    chipStockLabel: 'Stock up',
    chipStockGoal: 'I need to order some essentials for myself',
    // ── Docked input ──
    inputPlaceholderDocked: 'Ask, refine, or tell me what changed…',
    inputPlaceholderLoading: 'Flow is working…',
    // ── Presence widget ──
    presenceName: 'Flow',
    presenceRole: 'Your shopping companion',
    presenceOnline: 'Flow is online',
    // ── Plan board ──
    planAddItem: 'Add something else',
    planEditGift: 'Edit gift message',
    planSaveGift: 'Save message',
    planCancel: 'Cancel',
    planAddRecipient: 'Add recipient details',
    planCreateOrder: 'Create my order',
    planDeliveryTo: 'Delivery to',
    planConfirmed: 'Delivery confirmed',
    // ── Locked card ──
    orderLocked: 'Order locked',
    total: 'Total (incl. delivery)',
    remaining: 'REMAINING',
    expired: 'EXPIRED',
    payNow: 'Open checkout to pay',
    linkExpired: 'Link expired',
    openingCheckout: 'Opening checkout…',
    securePay: 'Secure payment on Kapruka.com — no account needed',
    copied: 'Copied',
    payHint: 'After payment, Kapruka emails your order number — use it here to track delivery.',
    // ── Bottom chips ──
    trackOrder: 'Track order',
    newFlow: 'Start a new flow',
    // ── Recipient form ──
    recipFormTitle: 'Who is it going to?',
    recipName: 'Recipient name',
    recipNamePh: 'e.g. Priya Silva',
    recipPhone: 'Phone number',
    recipPhonePh: 'e.g. 077 123 4567',
    recipAddress: 'Delivery address',
    recipAddressPh: 'House/flat no, street, area',
    recipConfirm: 'Confirm details',
    recipCancel: 'Cancel',
    recipNameErr: 'Please enter a name',
    recipPhoneErr: 'Enter a valid phone number',
    recipAddressErr: 'Please enter an address',
  },

  SI: {
    tagline: 'ඔබේ සාප්පු සහායකයා',                                    // review
    journey: ['ඉලක්කය', 'සොයමු', 'සැලසුම', 'බෙදාහැරීම', 'නිමයි'],   // review
    openingHeadline: 'අද Flow එකෙන් කරගන්න ඕනේ මොකක්ද?',                    // review
    openingSub: 'හරියටම ගැලපෙන තෑග්ග සොයාගමු',                      // review
    inputPlaceholderOpening: 'ඔබට අවශ්‍ය දේ කියන්න…',
    chipGiftLabel: 'තෑග්ගක් යවන්න',
    chipGiftGoal: 'මට කෙනෙකුට තෑග්ගක් යවන්න ඕනේ',
    chipCelebrateLabel: 'සැමරුමක්',
    chipCelebrateGoal: 'මට මහනුවරට මෙම සෙනසුරාදා උපන්දින කේක් එකක් යවන්න ඕනේ, මිල රු. 6,000 ට අඩුවෙන්',
    chipSayLabel: 'හැඟීමක්',
    chipSayGoal: 'ස්තූතියි කියන්න මල් සහ චොකලට් කොළඹට හෙට යවන්න ඕනේ',
    chipStockLabel: 'ගෙදරට බඩු',
    chipStockGoal: 'මට මගේම අවශ්‍යතා කිහිපයක් ඇණවුම් කරන්න ඕනේ',
    inputPlaceholderDocked: 'අහන්න, වෙනස් කරන්න, හෝ අලුත් දේ කියන්න…',
    inputPlaceholderLoading: 'Flow වැඩ කරමින්…',
    presenceName: 'Flow',
    presenceRole: 'ඔබේ සාප්පු සහායකයා',
    presenceOnline: 'Flow සම්බන්ධයි',
    planAddItem: 'තවත් එකක් එකතු කරන්න',
    planEditGift: 'තෑගි පණිවිඩය සංස්කරණය',
    planSaveGift: 'පණිවිඩය සුරකින්න',
    planCancel: 'අවලංගු කරන්න',
    planAddRecipient: 'ලබන්නාගේ විස්තර එකතු කරන්න',
    planCreateOrder: 'මගේ ඇණවුම සාදන්න',
    planDeliveryTo: 'බෙදාහැරීම',
    planConfirmed: 'බෙදාහැරීම තහවුරුයි',
    orderLocked: 'ඇණවුම තහවුරුයි',
    total: 'එකතුව (බෙදාහැරීම සමඟ)',
    remaining: 'ඉතිරි කාලය',
    expired: 'කල් ඉකුත්ය',
    payNow: 'ගෙවීමට checkout විවෘත කරන්න',
    linkExpired: 'සබැඳිය කල් ඉකුත්ය',
    openingCheckout: 'Checkout විවෘත වෙමින්…',
    securePay: 'Kapruka.com හි ආරක්ෂිත ගෙවීම — ගිණුමක් අවශ්‍ය නැත',
    copied: 'පිටපත් කළා',
    payHint: 'ගෙවීමෙන් පසු, Kapruka ඔබට ඇණවුම් අංකය email කරයි — එය මෙහි භාවිතා කර බෙදාහැරීම සොයන්න.',
    trackOrder: 'ඇණවුම සොයන්න',
    newFlow: 'අලුතින් පටන් ගන්න',
    recipFormTitle: 'මේක යන්නේ කාටද?',
    recipName: 'ලබන්නාගේ නම',
    recipNamePh: 'උදා: ප්‍රියා සිල්වා',
    recipPhone: 'දුරකථන අංකය',
    recipPhonePh: 'උදා: 077 123 4567',
    recipAddress: 'බෙදාහැරීමේ ලිපිනය',
    recipAddressPh: 'නිවස/මහල් අංකය, වීදිය, ප්‍රදේශය',
    recipConfirm: 'විස්තර තහවුරු කරන්න',
    recipCancel: 'අවලංගු කරන්න',
    recipNameErr: 'කරුණාකර නමක් ඇතුළත් කරන්න',
    recipPhoneErr: 'වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න',
    recipAddressErr: 'කරුණාකර ලිපිනයක් ඇතුළත් කරන්න',
  },

  TA: {
    // Tamil — natural Sri Lankan Tamil. Have a native speaker review the // review lines.
    tagline: 'உங்கள் ஷாப்பிங் துணை',                                    // review
    journey: ['இலக்கு', 'தேடல்', 'திட்டம்', 'விநியோகம்', 'முடிந்தது'],   // review
    openingHeadline: 'இன்று Flow என்ன செய்ய வேண்டும்?',                 // review
    openingSub: 'சரியான பரிசை எளிதாகக் கண்டுபிடிப்போம்',                // review
    inputPlaceholderOpening: 'உங்களுக்கு என்ன வேண்டும் என்று சொல்லுங்கள்…',
    chipGiftLabel: 'பரிசு அனுப்பு',
    chipGiftGoal: 'நான் ஒருவருக்கு பரிசு அனுப்ப விரும்புகிறேன்',
    chipCelebrateLabel: 'கொண்டாட்டம்',
    chipCelebrateGoal: 'எனக்கு இந்த சனிக்கிழமை கண்டிக்கு பிறந்தநாள் கேக் வேண்டும், விலை ரூ. 6,000 க்குள்',
    chipSayLabel: 'உணர்வு',
    chipSayGoal: 'நன்றி சொல்ல மலர்களும் சாக்லேட்டும் நாளை கொழும்புக்கு அனுப்ப வேண்டும்',
    chipStockLabel: 'பொருட்கள் வாங்க',
    chipStockGoal: 'எனக்கு சில அத்தியாவசியப் பொருட்கள் ஆர்டர் செய்ய வேண்டும்',
    inputPlaceholderDocked: 'கேளுங்கள், மாற்றுங்கள், அல்லது புதிதாக ஏதேனும் சொல்லுங்கள்…',
    inputPlaceholderLoading: 'Flow வேலை செய்கிறது…',
    presenceName: 'Flow',
    presenceRole: 'உங்கள் ஷாப்பிங் துணை',
    presenceOnline: 'Flow இணைப்பில் உள்ளது',
    planAddItem: 'மேலும் ஒன்றைச் சேர்க்க',
    planEditGift: 'பரிசுச் செய்தியைத் திருத்து',
    planSaveGift: 'செய்தியைச் சேமி',
    planCancel: 'ரத்து செய்',
    planAddRecipient: 'பெறுநர் விவரங்களைச் சேர்க்க',
    planCreateOrder: 'எனது ஆர்டரை உருவாக்கு',
    planDeliveryTo: 'விநியோகம்',
    planConfirmed: 'விநியோகம் உறுதி',
    orderLocked: 'ஆர்டர் உறுதி செய்யப்பட்டது',
    total: 'மொத்தம் (விநியோகம் உட்பட)',
    remaining: 'மீதமுள்ள நேரம்',
    expired: 'காலாவதியானது',
    payNow: 'பணம் செலுத்த checkout திறக்க',
    linkExpired: 'இணைப்பு காலாவதியானது',
    openingCheckout: 'Checkout திறக்கிறது…',
    securePay: 'Kapruka.com இல் பாதுகாப்பான பணம் — கணக்கு தேவையில்லை',
    copied: 'நகலெடுக்கப்பட்டது',
    payHint: 'பணம் செலுத்திய பிறகு, Kapruka உங்களுக்கு ஆர்டர் எண்ணை email செய்யும் — அதை இங்கே பயன்படுத்தி விநியோகத்தைக் கண்காணிக்கவும்.',
    trackOrder: 'ஆர்டரைக் கண்காணி',
    newFlow: 'புதிதாகத் தொடங்கு',
    recipFormTitle: 'இது யாருக்கு?',
    recipName: 'பெறுநரின் பெயர்',
    recipNamePh: 'எ.கா: பிரியா சில்வா',
    recipPhone: 'தொலைபேசி எண்',
    recipPhonePh: 'எ.கா: 077 123 4567',
    recipAddress: 'விநியோக முகவரி',
    recipAddressPh: 'வீடு/மாடி எண், தெரு, பகுதி',
    recipConfirm: 'விவரங்களை உறுதிப்படுத்து',
    recipCancel: 'ரத்து செய்',
    recipNameErr: 'தயவுசெய்து ஒரு பெயரை உள்ளிடவும்',
    recipPhoneErr: 'சரியான தொலைபேசி எண்ணை உள்ளிடவும்',
    recipAddressErr: 'தயவுசெய்து ஒரு முகவரியை உள்ளிடவும்',
  },
}

export const t = (lang, key) => (STRINGS[lang] && STRINGS[lang][key]) ?? STRINGS.EN[key]