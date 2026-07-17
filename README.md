# Insider Threat Monitor (Gmail DLP Extension)

## Nə edir?
- Gmail compose pəncərəsində "Send" düyməsinə klik olunanda mətndə kart nömrəsi
  pattern-i axtarır (regex + Luhn check).
- Tapılan nömrəni eyni formatda (uzunluq, boşluq/tire) təsadüfi rəqəmlərlə əvəz edir.
  Göndərən şəxs adi kimi email-i göndərir, heç bir xəbərdarlıq görmür.
- Qarşı tərəfə gedən məktubda əsl kart nömrəsi yoxdur — orijinal əvəzinə random
  rəqəmlər gedir.
- Eyni zamanda background service worker vasitəsilə SOC-a (Telegram bot və/və ya
  öz backend webhook-un) səssiz alert göndərilir. İstifadəçiyə heç bir popup/
  bildiriş göstərilmir.

## Qurulum (test üçün, "Load unpacked")
1. `chrome://extensions` aç, "Developer mode"-u aktiv et.
2. "Load unpacked" düyməsinə bas, bu qovluğu seç.
3. Extension ikonuna klik et (və ya options səhifəsini aç), Telegram bot token,
   chat ID və/və ya webhook URL-i daxil et.
4. Gmail-də test compose yaz, içinə test kart nömrəsi qoy (Luhn-keçən test
   nömrələr: `4111 1111 1111 1111`, `5500 0000 0000 0004`) və "Send" et.

## Real (enterprise) deployment üçün vacib tövsiyələr
- **Force-install policy**: Extension-ı Google Workspace / Chrome Enterprise
  admin konsolu vasitəsilə bütün işçi cihazlarına məcburi install et ki, adi
  işçi onu söndürə/silə bilməsin.
- **Managed storage**: Token/webhook kimi həssas ayarları `options.html`
  vasitəsilə yox, Chrome-un "managed storage" (policy JSON) vasitəsilə ötür ki,
  işçi bu ayarları görə/dəyişə bilməsin.
- **DOM strukturu**: Gmail-in HTML strukturu tez-tez dəyişir; production üçün
  `innerHTML` string-replace əvəzinə `TreeWalker` ilə mətn node-larını dəqiq
  hədəfləmək daha etibarlıdır.
- **Server-side backup**: Client-side (brauzer) məlumatın 100%-i etibarlı yer
  deyil — paralel olaraq server-side (mail gateway / DLP proxy) yoxlama da
  tövsiyə olunur, çünki brauzer extension-ı DevTools ilə deaktiv/dəyişdirilə bilər.

## Hüquqi / etik qeyd
Əksər yurisdiksiyalarda işəgötürənin işçi kommunikasiyalarını monitorinq etməsi
qanunidir, AMMA adətən **əvvəlcədən yazılı bildiriş/razılıq** (əmək müqaviləsi,
IT təhlükəsizlik siyasəti və s.) tələb olunur — yəni işçi "kommunikasiyalarım
monitorinq oluna bilər" faktından xəbərdar olmalıdır, hətta real-time alert-lər
ona göstərilməsə belə. Bunu tətbiq etməzdən əvvəl HR/hüquq şöbəniz ilə
razılaşdırmağınızı tövsiyə edirəm.
