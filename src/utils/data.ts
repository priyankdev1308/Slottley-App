import { icons } from '../../assets/icons';

export const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      html, body {
        background: transparent !important;
        overflow: hidden;
      }

      body {
        background-color: rgba(30, 30, 60, 0.3);
      }

      .widget-wrapper {
        width: 100%;
        height: 42px;
        overflow: hidden;
         background-color: rgba(30, 30, 60, 0.3);
      }

      .tradingview-widget-container {
        width: 100% !important;
        height: 42px !important;
        position: relative;
        overflow: hidden;
        background: transparent !important;
        pointer-events: none;
        user-select: none;
      }

      .tradingview-widget-container iframe {
        width: 125% !important;
        height: 42px !important;
        background: transparent !important;
        transform: scale(0.8);
        transform-origin: left center;
      }

      /* Safety: hide logos */
      .tradingview-widget-container img,
      .tradingview-widget-container svg {
        display: none !important;
      }
    </style>
  </head>

  <body>
    <div class="widget-wrapper">
      <div class="tradingview-widget-container">
        <script
          type="text/javascript"
          src="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
          async
        >
        {
          "symbols": [
            { "proName": "NASDAQ:AAPL", "title": "Apple" },
            { "proName": "NASDAQ:MSFT", "title": "Microsoft" },
            { "proName": "NASDAQ:AMZN", "title": "Amazon" },
            { "proName": "NASDAQ:META", "title": "Meta" },
            { "proName": "NASDAQ:NVDA", "title": "NVIDIA" },
            { "proName": "NASDAQ:TSLA", "title": "Tesla" },

            { "proName": "TVC:GOLD", "title": "Gold" },
            { "proName": "FOREXCOM:XAUUSD", "title": "Gold (XAU/USD)" },
            { "proName": "FOREXCOM:XAGUSD", "title": "Silver (XAG/USD)" },
            { "proName": "TVC:USOIL", "title": "Crude Oil" },

            { "proName": "FOREXCOM:EURUSD", "title": "EUR/USD" },
            { "proName": "FOREXCOM:GBPUSD", "title": "GBP/USD" },
            { "proName": "FOREXCOM:AUDUSD", "title": "AUD/USD" },
            { "proName": "FOREXCOM:NZDUSD", "title": "NZD/USD" },
            { "proName": "FOREXCOM:USDJPY", "title": "USD/JPY" },
            { "proName": "FOREXCOM:USDCHF", "title": "USD/CHF" },
            { "proName": "FOREXCOM:USDCAD", "title": "USD/CAD" },

            { "proName": "BINANCE:BTCUSDT", "title": "Bitcoin" },
            { "proName": "BINANCE:ETHUSDT", "title": "Ethereum" },
            { "proName": "BINANCE:LTCUSDT", "title": "Litecoin" },
            { "proName": "BINANCE:XRPUSDT", "title": "XRP" },
            { "proName": "BINANCE:SOLUSDT", "title": "Solana" },
            { "proName": "BINANCE:ADAUSDT", "title": "Cardano" }
          ],
          "colorTheme": "dark",
          "isTransparent": true,
          "displayMode": "regular",
          "locale": "en",
          "showSymbolLogo": false
        }
        </script>
      </div>
    </div>
  </body>
</html>
`;

export const listData = [
  {
    id: '1',
    icon: icons.community,
    title: 'Active Community',
    subtitle:
      'Connect with like-minded traders and learn from their experiences.',
  },
  {
    id: '2',
    icon: icons.book,
    title: 'Educational Resources',
    subtitle:
      'Learn from basics to advanced concepts and develop your own trading approach.',
  },
  {
    id: '3',
    icon: icons.expert,
    title: 'Expert Guidance',
    subtitle:
      'Access high-quality market research inspired by institutional and hedge fund reports.',
  },
  {
    id: '4',
    icon: icons.chart,
    title: 'Market Updates',
    subtitle:
      'Explore interactive content and strengthen your market understanding.',
  },
];

export const rules = [
  {
    title: 'Community Guidelines',
    icon: icons.community,
    rule: [
      ' Treat all members with respect and courtesy.',
      ' No harassment, hate speech, or discrimination.',
      ' Keep discussions professional and constructive.',
      ' Use appropriate language at all times.',
    ],
  },
  {
    title: 'Trading Rules',
    icon: icons.dollar,
    rule: [
      ' No financial advice – all posts are for educational purposes only.',
      ' Always conduct your own research and due diligence.',
      " Don't share personal trading account details.",
      ' No pump and dump schemes or market manipulation',
    ],
  },
  {
    title: 'Content Posting',
    icon: icons.message,
    rule: [
      ' Use relevant categories for your posts.',
      ' No spam or excessive self-promotion.',
      ' Include clear analysis and reasoning in trading posts.',
      ' Keep discussions on-topic and trading-related.',
    ],
  },
  {
    title: 'Risk Warnings',
    icon: icons.warning,
    rule: [
      ' Trading carries significant financial risk.',
      ' Never invest more than you can afford to lose.',
      ' Past performance is not indicative of future results.',
      ' Be aware of your local trading regulations.',
    ],
  },
  {
    title: 'Security',
    icon: icons.shield,
    rule: [
      ' Never share login credentials or personal information.',
      ' Use strong passwords and enable 2FA where available.',
      ' Report suspicious activity immediately.',
      ' Be cautious of direct messages about investments.',
    ],
  },
  {
    title: 'Violations & Penalties',
    icon: icons.balance,
    rule: [
      ' Rule violations may result in warnings or suspension.',
      ' Serious violations lead to permanent account termination.',
      ' Appeals can be made through proper channels.',
      ' Moderator decisions are final.',
    ],
  },
];

export const countryDialCodes: { [key: string]: string } = {
  AF: '+93',
  AX: '+358',
  AL: '+355',
  DZ: '+213',
  AS: '+1-684',
  AD: '+376',
  AO: '+244',
  AI: '+1-264',
  AQ: '+672',
  AG: '+1-268',
  AR: '+54',
  AM: '+374',
  AW: '+297',
  AU: '+61',
  AT: '+43',
  AZ: '+994',
  BS: '+1-242',
  BH: '+973',
  BD: '+880',
  BB: '+1-246',
  BY: '+375',
  BE: '+32',
  BZ: '+501',
  BJ: '+229',
  BM: '+1-441',
  BT: '+975',
  BO: '+591',
  BQ: '+599',
  BA: '+387',
  BW: '+267',
  BR: '+55',
  IO: '+246',
  VG: '+1-284',
  BN: '+673',
  BG: '+359',
  BF: '+226',
  BI: '+257',
  KH: '+855',
  CM: '+237',
  CA: '+1',
  CV: '+238',
  KY: '+1-345',
  CF: '+236',
  TD: '+235',
  CL: '+56',
  CN: '+86',
  CX: '+61',
  CC: '+61',
  CO: '+57',
  KM: '+269',
  CD: '+243',
  CG: '+242',
  CK: '+682',
  CR: '+506',
  CI: '+225',
  HR: '+385',
  CU: '+53',
  CW: '+599',
  CY: '+357',
  CZ: '+420',
  DK: '+45',
  DJ: '+253',
  DM: '+1-767',
  DO: '+1-809',
  DO2: '+1-829',
  DO3: '+1-849',
  EC: '+593',
  EG: '+20',
  SV: '+503',
  GQ: '+240',
  ER: '+291',
  EE: '+372',
  ET: '+251',
  FK: '+500',
  FO: '+298',
  FJ: '+679',
  FI: '+358',
  FR: '+33',
  GF: '+594',
  PF: '+689',
  GA: '+241',
  GM: '+220',
  GE: '+995',
  DE: '+49',
  GH: '+233',
  GI: '+350',
  GR: '+30',
  GL: '+299',
  GD: '+1-473',
  GP: '+590',
  GU: '+1-671',
  GT: '+502',
  GG: '+44',
  GN: '+224',
  GW: '+245',
  GY: '+592',
  HT: '+509',
  HN: '+504',
  HK: '+852',
  HU: '+36',
  IS: '+354',
  IN: '+91',
  ID: '+62',
  IR: '+98',
  IQ: '+964',
  IE: '+353',
  IM: '+44',
  IL: '+972',
  IT: '+39',
  JM: '+1-876',
  JP: '+81',
  JE: '+44',
  JO: '+962',
  KZ: '+7',
  KE: '+254',
  KI: '+686',
  XZ: '+850', // Kosovo
  KW: '+965',
  KG: '+996',
  LA: '+856',
  LV: '+371',
  LB: '+961',
  LS: '+266',
  LR: '+231',
  LY: '+218',
  LI: '+423',
  LT: '+370',
  LU: '+352',
  MO: '+853',
  MK: '+389',
  MG: '+261',
  MW: '+265',
  MY: '+60',
  MV: '+960',
  ML: '+223',
  MT: '+356',
  MH: '+692',
  MQ: '+596',
  MR: '+222',
  MU: '+230',
  YT: '+262',
  MX: '+52',
  FM: '+691',
  MD: '+373',
  MC: '+377',
  MN: '+976',
  ME: '+382',
  MS: '+1-664',
  MA: '+212',
  MZ: '+258',
  MM: '+95',
  NA: '+264',
  NR: '+674',
  NP: '+977',
  NL: '+31',
  NC: '+687',
  NZ: '+64',
  NI: '+505',
  NE: '+227',
  NG: '+234',
  NU: '+683',
  NF: '+672',
  MP: '+1-670',
  KP: '+850',
  NO: '+47',
  OM: '+968',
  PK: '+92',
  PW: '+680',
  PS: '+970',
  PA: '+507',
  PG: '+675',
  PY: '+595',
  PE: '+51',
  PH: '+63',
  PN: '+870',
  PL: '+48',
  PT: '+351',
  PR: '+1-787',
  PR2: '+1-939',
  QA: '+974',
  RE: '+262',
  RO: '+40',
  RU: '+7',
  RW: '+250',
  BL: '+590',
  SH: '+290',
  KN: '+1-869',
  LC: '+1-758',
  MF: '+590',
  PM: '+508',
  VC: '+1-784',
  WS: '+685',
  SM: '+378',
  ST: '+239',
  SA: '+966',
  SN: '+221',
  RS: '+381',
  SC: '+248',
  SL: '+232',
  SG: '+65',
  SX: '+1-721',
  SK: '+421',
  SI: '+386',
  SB: '+677',
  SO: '+252',
  ZA: '+27',
  KR: '+82',
  SS: '+211',
  ES: '+34',
  LK: '+94',
  SD: '+249',
  SR: '+597',
  SJ: '+47',
  SZ: '+268',
  SE: '+46',
  CH: '+41',
  SY: '+963',
  TW: '+886',
  TJ: '+992',
  TZ: '+255',
  TH: '+66',
  TL: '+670',
  TG: '+228',
  TK: '+690',
  TO: '+676',
  TT: '+1-868',
  TN: '+216',
  TR: '+90',
  TM: '+993',
  TC: '+1-649',
  TV: '+688',
  UG: '+256',
  UA: '+380',
  AE: '+971',
  GB: '+44',
  US: '+1',
  UY: '+598',
  UZ: '+998',
  VU: '+678',
  VA: '+379',
  VE: '+58',
  VN: '+84',
  WF: '+681',
  EH: '+212',
  YE: '+967',
  ZM: '+260',
  ZW: '+263',
};
