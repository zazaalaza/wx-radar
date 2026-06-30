export interface Station {
  code: string;
  country: string;
  folder: string;
  name: string;
  lat: number;
  lon: number;
  /** UTC minutes when routine METAR rows are captured (carried over from source; unused by radar). */
  metarReadings: number[];
  defaultUnit: 'm' | 'e';
  timezone: string;
}

export const STATIONS: Station[] = [
  // ── UTC+12/+13 ──────────────────────────────────────────────────────────────
  { code: 'NZWN', country: 'NZ', folder: 'wellington',      name: 'WELLINGTON',   lat: -41.3272, lon: 174.8053,  metarReadings: [6, 36],    defaultUnit: 'm', timezone: 'Pacific/Auckland'               },
  // ── UTC+10/+11 ──────────────────────────────────────────────────────────────
  { code: 'YSSY', country: 'AU', folder: 'sydney',          name: 'SYDNEY',       lat: -33.9465, lon: 151.1731,  metarReadings: [8, 38],    defaultUnit: 'm', timezone: 'Australia/Sydney'               },
  // ── UTC+9 ────────────────────────────────────────────────────────────────────
  { code: 'RKSI', country: 'KR', folder: 'seoul',           name: 'SEOUL',        lat: 37.4602,  lon: 126.4407,  metarReadings: [6, 36],    defaultUnit: 'm', timezone: 'Asia/Seoul'                     },
  { code: 'RKPK', country: 'KR', folder: 'busan',           name: 'BUSAN',        lat: 35.1795,  lon: 128.9382,  metarReadings: [6],        defaultUnit: 'm', timezone: 'Asia/Seoul'                     },
  { code: 'RJTT', country: 'JP', folder: 'tokyo',           name: 'TOKYO',        lat: 35.5533,  lon: 139.7811,  metarReadings: [7, 40],    defaultUnit: 'm', timezone: 'Asia/Tokyo'                     },
  // ── UTC+8 ────────────────────────────────────────────────────────────────────
  { code: 'ZBAA', country: 'CN', folder: 'beijing',         name: 'BEIJING',      lat: 40.0741,  lon: 116.587,   metarReadings: [7, 37],    defaultUnit: 'm', timezone: 'Asia/Shanghai'                  },
  { code: 'ZUUU', country: 'CN', folder: 'chengdu',         name: 'CHENGDU',      lat: 30.6667,  lon: 104.0167,  metarReadings: [8],        defaultUnit: 'm', timezone: 'Asia/Shanghai'                  },
  { code: 'ZUCK', country: 'CN', folder: 'chongqing',       name: 'CHONGQING',    lat: 29.52,    lon: 106.48,    metarReadings: [8],        defaultUnit: 'm', timezone: 'Asia/Shanghai'                  },
  { code: 'ZGGG', country: 'CN', folder: 'guangzhou',       name: 'GUANGZHOU',    lat: 23.3964,  lon: 113.3008,  metarReadings: [7, 37],    defaultUnit: 'm', timezone: 'Asia/Shanghai'                  },
  { code: 'VHHH', country: 'HK', folder: 'hong_kong',       name: 'HONG KONG',    lat: 22.309,   lon: 113.922,   metarReadings: [4, 34],    defaultUnit: 'm', timezone: 'Asia/Hong_Kong'                 },
  { code: 'RPLL', country: 'PH', folder: 'manila',          name: 'MANILA',       lat: 14.5069,  lon: 121.0042,  metarReadings: [4],        defaultUnit: 'm', timezone: 'Asia/Manila'                    },
  { code: 'WMKK', country: 'MY', folder: 'kuala_lumpur',    name: 'KUALA L.',     lat: 2.7167,   lon: 101.7,     metarReadings: [10, 40],   defaultUnit: 'm', timezone: 'Asia/Kuala_Lumpur'              },
  { code: 'ZSPD', country: 'CN', folder: 'shanghai',        name: 'SHANGHAI',     lat: 31.1167,  lon: 121.7667,  metarReadings: [7, 37],    defaultUnit: 'm', timezone: 'Asia/Shanghai'                  },
  { code: 'ZGSZ', country: 'CN', folder: 'shenzhen',        name: 'SHENZHEN',     lat: 22.55,    lon: 114.1,     metarReadings: [8],        defaultUnit: 'm', timezone: 'Asia/Shanghai'                  },
  { code: 'ZSQD', country: 'CN', folder: 'qingdao',         name: 'QINGDAO',      lat: 36.0667,  lon: 120.3333,  metarReadings: [8],        defaultUnit: 'm', timezone: 'Asia/Shanghai'                  },
  { code: 'WSSS', country: 'SG', folder: 'singapore',       name: 'SINGAPORE',    lat: 1.3667,   lon: 103.9833,  metarReadings: [3, 32],    defaultUnit: 'm', timezone: 'Asia/Singapore'                 },
  { code: 'RCSS', country: 'TW', folder: 'taipei',          name: 'TAIPEI',       lat: 25.0694,  lon: 121.5517,  metarReadings: [11, 38],   defaultUnit: 'm', timezone: 'Asia/Taipei'                    },
  { code: 'ZHHH', country: 'CN', folder: 'wuhan',           name: 'WUHAN',        lat: 30.62,    lon: 114.13,    metarReadings: [8],        defaultUnit: 'm', timezone: 'Asia/Shanghai'                  },
  // ── UTC+7 ────────────────────────────────────────────────────────────────────
  { code: 'WIHH', country: 'ID', folder: 'jakarta',         name: 'JAKARTA',      lat: -6.2666,  lon: 106.8911,  metarReadings: [7, 37],    defaultUnit: 'm', timezone: 'Asia/Jakarta'                   },
  // ── UTC+5 ────────────────────────────────────────────────────────────────────
  { code: 'OPKC', country: 'PK', folder: 'karachi',         name: 'KARACHI',      lat: 24.8456,  lon: 67.1614,   metarReadings: [3, 33],    defaultUnit: 'm', timezone: 'Asia/Karachi'                   },
  // ── UTC+5:30 ─────────────────────────────────────────────────────────────────
  { code: 'VILK', country: 'IN', folder: 'lucknow',         name: 'LUCKNOW',      lat: 26.7606,  lon: 80.8893,   metarReadings: [6, 36],    defaultUnit: 'm', timezone: 'Asia/Kolkata'                   },
  // ── UTC+4 ────────────────────────────────────────────────────────────────────
  { code: 'OMAA', country: 'AE', folder: 'abu_dhabi',       name: 'ABU DHABI',    lat: 24.433,   lon: 54.651,    metarReadings: [2, 31],    defaultUnit: 'm', timezone: 'Asia/Dubai'                     },
  { code: 'OMDB', country: 'AE', folder: 'dubai',           name: 'DUBAI',        lat: 25.254,   lon: 55.366,    metarReadings: [2, 31],    defaultUnit: 'm', timezone: 'Asia/Dubai'                     },
  // ── UTC+3 ────────────────────────────────────────────────────────────────────
  { code: 'LLBG', country: 'IL', folder: 'tel_aviv',        name: 'TEL AVIV',     lat: 32.0114,  lon: 34.8867,   metarReadings: [23, 53],   defaultUnit: 'm', timezone: 'Asia/Jerusalem'                 },
  { code: 'LTAC', country: 'TR', folder: 'ankara',          name: 'ANKARA',       lat: 40.1281,  lon: 32.9951,   metarReadings: [27, 57],   defaultUnit: 'm', timezone: 'Europe/Istanbul'                },
  { code: 'LTFM', country: 'TR', folder: 'istanbul',        name: 'ISTANBUL',     lat: 41.2629,  lon: 28.7413,   metarReadings: [27, 57],   defaultUnit: 'm', timezone: 'Europe/Istanbul'                },
  { code: 'UUWW', country: 'RU', folder: 'moscow',          name: 'MOSCOW',       lat: 55.5915,  lon: 37.2615,   metarReadings: [6, 36],    defaultUnit: 'm', timezone: 'Europe/Moscow'                  },
  { code: 'OEJN', country: 'SA', folder: 'jeddah',          name: 'JEDDAH',       lat: 21.6598,  lon: 39.1222,   metarReadings: [2],        defaultUnit: 'm', timezone: 'Asia/Riyadh'                    },
  // ── UTC+2 ────────────────────────────────────────────────────────────────────
  { code: 'FACT', country: 'ZA', folder: 'cape_town',       name: 'CAPE TOWN',    lat: -33.9667, lon: 18.6,      metarReadings: [7],        defaultUnit: 'm', timezone: 'Africa/Johannesburg'            },
  { code: 'EFHK', country: 'FI', folder: 'helsinki',        name: 'HELSINKI',     lat: 60.3172,  lon: 24.9633,   metarReadings: [23, 53],   defaultUnit: 'm', timezone: 'Europe/Helsinki'                },
  // ── UTC+1 ────────────────────────────────────────────────────────────────────
  { code: 'EPWA', country: 'PL', folder: 'warsaw',          name: 'WARSAW',       lat: 52.1628,  lon: 20.9611,   metarReadings: [4, 34],    defaultUnit: 'm', timezone: 'Europe/Warsaw'                  },
  { code: 'LIMC', country: 'IT', folder: 'milan',           name: 'MILAN',        lat: 45.63,    lon: 8.7231,    metarReadings: [27, 57],   defaultUnit: 'm', timezone: 'Europe/Rome'                    },
  { code: 'EDDM', country: 'DE', folder: 'munich',          name: 'MUNICH',       lat: 48.3538,  lon: 11.7861,   metarReadings: [25, 55],   defaultUnit: 'm', timezone: 'Europe/Berlin'                  },
  { code: 'LFPB', country: 'FR', folder: 'paris',           name: 'PARIS',        lat: 48.9672,  lon: 2.4272,    metarReadings: [4, 34],    defaultUnit: 'm', timezone: 'Europe/Paris'                   },
  { code: 'EHAM', country: 'NL', folder: 'amsterdam',       name: 'AMSTERDAM',    lat: 52.3154,  lon: 4.7902,    metarReadings: [29, 59],   defaultUnit: 'm', timezone: 'Europe/Amsterdam'               },
  { code: 'LEMD', country: 'ES', folder: 'madrid',          name: 'MADRID',       lat: 40.4667,  lon: -3.5556,   metarReadings: [6, 36],    defaultUnit: 'm', timezone: 'Europe/Madrid'                  },
  { code: 'DNMM', country: 'NG', folder: 'lagos',           name: 'LAGOS',        lat: 6.5774,   lon: 3.3212,    metarReadings: [13],       defaultUnit: 'm', timezone: 'Africa/Lagos'                   },
  // ── UTC+0 ────────────────────────────────────────────────────────────────────
  { code: 'EGLC', country: 'GB', folder: 'london',          name: 'LONDON',       lat: 51.505,   lon: 0.055,     metarReadings: [26, 56],   defaultUnit: 'm', timezone: 'Europe/London'                  },
  // ── UTC-3 ────────────────────────────────────────────────────────────────────
  { code: 'SAEZ', country: 'AR', folder: 'buenos_aires',    name: 'B. AIRES',     lat: -34.815,  lon: -58.535,   metarReadings: [6],        defaultUnit: 'm', timezone: 'America/Argentina/Buenos_Aires' },
  { code: 'SBGR', country: 'BR', folder: 'sao_paulo',       name: 'SAO PAULO',    lat: -23.4356, lon: -46.4731,  metarReadings: [1],        defaultUnit: 'm', timezone: 'America/Sao_Paulo'              },
  // ── UTC-5 ────────────────────────────────────────────────────────────────────
  { code: 'CYUL', country: 'CA', folder: 'montreal',        name: 'MONTREAL',     lat: 45.4683,  lon: -73.7414,  metarReadings: [9],        defaultUnit: 'm', timezone: 'America/Toronto'                },
  { code: 'CYYZ', country: 'CA', folder: 'toronto',         name: 'TORONTO',      lat: 43.6777,  lon: -79.6248,  metarReadings: [9],        defaultUnit: 'm', timezone: 'America/Toronto'                },
  { code: 'MPMG', country: 'PA', folder: 'panama_city',     name: 'PANAMA',       lat: 8.9833,   lon: -79.5167,  metarReadings: [1],        defaultUnit: 'm', timezone: 'America/Panama'                 },
  { code: 'KATL', country: 'US', folder: 'atlanta',         name: 'ATLANTA',      lat: 33.6407,  lon: -84.4277,  metarReadings: [56],       defaultUnit: 'e', timezone: 'America/New_York'               },
  { code: 'KBOS', country: 'US', folder: 'boston',          name: 'BOSTON',       lat: 42.3656,  lon: -71.0096,  metarReadings: [58],       defaultUnit: 'e', timezone: 'America/New_York'               },
  { code: 'KCLT', country: 'US', folder: 'charlotte',       name: 'CHARLOTTE',    lat: 35.214,   lon: -80.9431,  metarReadings: [56],       defaultUnit: 'e', timezone: 'America/New_York'               },
  { code: 'KJAX', country: 'US', folder: 'jacksonville',    name: 'JACKSON',      lat: 30.4941,  lon: -81.6879,  metarReadings: [0, 59],    defaultUnit: 'e', timezone: 'America/New_York'               },
  { code: 'KMIA', country: 'US', folder: 'miami',           name: 'MIAMI',        lat: 25.7881,  lon: -80.3169,  metarReadings: [57],       defaultUnit: 'e', timezone: 'America/New_York'               },
  { code: 'KLGA', country: 'US', folder: 'nyc',             name: 'NYC',          lat: 40.7794,  lon: -73.8803,  metarReadings: [56],       defaultUnit: 'e', timezone: 'America/New_York'               },
  { code: 'KPHL', country: 'US', folder: 'philadelphia',    name: 'PHILY',        lat: 39.8733,  lon: -75.2268,  metarReadings: [58],       defaultUnit: 'e', timezone: 'America/New_York'               },
  { code: 'KDCA', country: 'US', folder: 'washington_dc',   name: 'D.C.',         lat: 38.8521,  lon: -77.0377,  metarReadings: [56],       defaultUnit: 'e', timezone: 'America/New_York'               },
  { code: 'KDTW', country: 'US', folder: 'detroit',         name: 'DETROIT',      lat: 42.2124,  lon: -83.3494,  metarReadings: [57],       defaultUnit: 'e', timezone: 'America/Detroit'                },
  // ── UTC-6 ────────────────────────────────────────────────────────────────────
  { code: 'MMMX', country: 'MX', folder: 'mexico_city',     name: 'MEXICO C.',    lat: 19.4363,  lon: -99.0721,  metarReadings: [1],        defaultUnit: 'm', timezone: 'America/Mexico_City'            },
  { code: 'KAUS', country: 'US', folder: 'austin',          name: 'AUSTIN',       lat: 30.2099,  lon: -97.6806,  metarReadings: [57],       defaultUnit: 'e', timezone: 'America/Chicago'                },
  { code: 'KORD', country: 'US', folder: 'chicago',         name: 'CHICAGO',      lat: 41.9602,  lon: -87.9316,  metarReadings: [55],       defaultUnit: 'e', timezone: 'America/Chicago'                },
  { code: 'KDAL', country: 'US', folder: 'dallas',          name: 'DALLAS',       lat: 32.8471,  lon: -96.8518,  metarReadings: [57],       defaultUnit: 'e', timezone: 'America/Chicago'                },
  { code: 'KHOU', country: 'US', folder: 'houston',         name: 'HOUSTON',      lat: 29.6454,  lon: -95.2788,  metarReadings: [57],       defaultUnit: 'e', timezone: 'America/Chicago'                },
  { code: 'KMSP', country: 'US', folder: 'minneapolis',     name: 'MINNEAPOLIS',  lat: 44.8848,  lon: -93.2223,  metarReadings: [57],       defaultUnit: 'e', timezone: 'America/Chicago'                },
  { code: 'KBNA', country: 'US', folder: 'nashville',       name: 'NASHVILLE',    lat: 36.1263,  lon: -86.6774,  metarReadings: [57],       defaultUnit: 'e', timezone: 'America/Chicago'                },
  { code: 'KMSY', country: 'US', folder: 'new_orleans',     name: 'N. ORLEANS',   lat: 29.9934,  lon: -90.258,   metarReadings: [57],       defaultUnit: 'e', timezone: 'America/Chicago'                },
  { code: 'KOKC', country: 'US', folder: 'oklahoma_city',   name: 'OKLAHOMA',     lat: 35.3931,  lon: -97.6007,  metarReadings: [56],       defaultUnit: 'e', timezone: 'America/Chicago'                },
  { code: 'KSAT', country: 'US', folder: 'san_antonio',     name: 'S. ANTONIO',   lat: 29.5339,  lon: -98.4691,  metarReadings: [55],       defaultUnit: 'e', timezone: 'America/Chicago'                },
  // ── UTC-7 ────────────────────────────────────────────────────────────────────
  { code: 'KBKF', country: 'US', folder: 'denver',          name: 'DENVER',       lat: 39.7017,  lon: -104.7517, metarReadings: [11],       defaultUnit: 'e', timezone: 'America/Denver'                 },
  { code: 'KPHX', country: 'US', folder: 'phoenix',         name: 'PHOENIX',      lat: 33.4343,  lon: -112.0116, metarReadings: [55],       defaultUnit: 'e', timezone: 'America/Phoenix'                },
  // ── UTC-8 ────────────────────────────────────────────────────────────────────
  { code: 'KLAS', country: 'US', folder: 'las_vegas',       name: 'VEGAS',        lat: 36.08,    lon: -115.1522, metarReadings: [0, 59],    defaultUnit: 'e', timezone: 'America/Los_Angeles'            },
  { code: 'KLAX', country: 'US', folder: 'los_angeles',     name: 'L.A.',         lat: 33.9382,  lon: -118.387,  metarReadings: [57],       defaultUnit: 'e', timezone: 'America/Los_Angeles'            },
  { code: 'KSFO', country: 'US', folder: 'san_francisco',   name: 'S.F.',         lat: 37.619,   lon: -122.3741, metarReadings: [0, 59],    defaultUnit: 'e', timezone: 'America/Los_Angeles'            },
  { code: 'KSEA', country: 'US', folder: 'seattle',         name: 'SEATTLE',      lat: 47.4489,  lon: -122.3094, metarReadings: [57],       defaultUnit: 'e', timezone: 'America/Los_Angeles'            },
  { code: 'CYHC', country: 'CA', folder: 'vancouver',       name: 'VANCOUVER',    lat: 49.2953,  lon: -123.1219, metarReadings: [],         defaultUnit: 'm', timezone: 'America/Vancouver'              },
];
