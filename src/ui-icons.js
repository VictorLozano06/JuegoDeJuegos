// Original line icons for Dev Empire 3D, shared by the interface and canvas.
const ICON_PATTERN = /\[\[DE_ICON_(\d{3})\]\]/g;
const ICON_TOTAL = 154;

const ICON_PATHS = {
  "1": "M7 8h10l3 3 1 6-2 2-4-3H9l-4 3-2-2 1-6z M7 12h4 M9 10v4 M16 11h1 M18 13h1",
  "2": "M5 19l3-6L17 4l3 3-9 9z M5 19l6-3 M15 6l3 3",
  "3": "M12 20c-5 0-7-3-6-7 1-3 3-4 4-8 3 2 5 5 4 8 1-1 2-2 2-4 4 5 3 11-4 11z",
  "4": "M3 7h18v10H3z M5 10h1 M18 14h1 M12 9v6 M14 10h-3a1.5 1.5 0 0 0 0 3h2a1.5 1.5 0 0 1 0 3h-3",
  "5": "M12 3l2.5 5.8 6.2.5-4.8 4.1 1.5 6.2L12 16l-5.4 3.6 1.5-6.2L3.3 9.3l6.2-.5z",
  "6": "M8 4l5 5-2 2-5-5z M12 10l3 3c3 3 1 6-2 6H6 M4 20h14 M5 16h8",
  "7": "M8 5v14 M16 5v14",
  "8": "M4 10h4l5-4v12l-5-4H4z M16 9c2 2 2 4 0 6 M18 6c4 4 4 8 0 12",
  "9": "M19 12H5 M10 7l-5 5 5 5",
  "10": "M8 5l11 7-11 7z",
  "11": "M5 19l3-6L17 4l3 3-9 9z M5 19l6-3 M15 6l3 3",
  "12": "M4 19h16 M6 16v-4 M11 16V8 M16 16V5 M5 9l5-3 4 2 5-5",
  "13": "M4 7l8-4 8 4v10l-8 4-8-4z M4 7l8 4 8-4 M12 11v10",
  "14": "M12 3l10 18H2z M12 9v5 M12 17v1",
  "15": "M5 19l10-10 M13 5l2-2 4 4-2 2-3-1-7 11H4v-3l10-9z",
  "16": "M12 3l10 18H2z M12 9v5 M12 17v1",
  "17": "M5 19l10-10 M13 5l2-2 4 4-2 2-3-1-7 11H4v-3l10-9z",
  "18": "M4 5h16v11H4z M9 20h6 M12 16v4",
  "19": "M12 4c-5 0-9 4-9 9 0 4 3 7 7 7h2c2 0 3-1 2-3-1-1 0-2 2-2h2c5 0 4-11-6-11z M7 10h.1 M10 7h.1 M15 8h.1 M18 11h.1",
  "20": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M3 12h18 M12 3c-4 4-4 14 0 18 M12 3c4 4 4 14 0 18",
  "21": "M12 3l8 3v5c0 5-3 8-8 10-5-2-8-5-8-10V6z M8 12l3 3 5-6",
  "22": "M13 2L5 13h6l-1 9 9-12h-6z",
  "23": "M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M9 12l2 2 4-4",
  "24": "M9 15c0-5 3-9 9-12 1 6-1 11-6 13z M9 15l-4 1-2 4 5-1 M12 16l-1 4 4-2 1-4 M15 7h1",
  "25": "M3 11l4-4 4 2 2-1 7 4-3 4-4-2-3 2-4-3z M3 11l4 4 M20 12l1 2",
  "26": "M12 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M5 20c0-5 3-7 7-7s7 2 7 7z",
  "27": "M12 4v16 M4 12h16",
  "28": "M8 15c0-2-3-3-3-7a7 7 0 0 1 14 0c0 4-3 5-3 7z M9 18h6 M10 21h4",
  "29": "M4 8h13v6c0 4-3 6-6 6s-7-2-7-6z M17 10h2c3 0 3 4 0 4h-2 M8 3v3 M12 3v3",
  "30": "M4 19h16 M6 16v-4 M11 16V8 M16 16V5 M5 9l5-3 4 2 5-5",
  "31": "M8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M3 19c0-4 2-6 5-6s5 2 5 6z M16 6a3 3 0 0 1 0 6 M15 14c4 0 6 2 6 5",
  "32": "M12 12v9 M8 21h8 M9 9a4 4 0 0 1 6 0 M6 6a8 8 0 0 1 12 0 M12 12h.1",
  "33": "M3 10l12-5v14L3 14z M15 9h4l2 3-2 3h-4 M6 15l2 5h3l-1-5",
  "34": "M4 5h6c-2 4 3 4 2 0h8v6c-4-2-4 3 0 2v6h-7c2-4-3-4-2 0H4v-6c4 2 4-3 0-2z",
  "35": "M5 21V4h14v17 M3 21h18 M8 8h2 M14 8h2 M8 12h2 M14 12h2 M10 21v-5h4v5",
  "36": "M19 12H5 M10 7l-5 5 5 5",
  "37": "M7 8h10l3 3 1 6-2 2-4-3H9l-4 3-2-2 1-6z M7 12h4 M9 10v4 M16 11h1 M18 13h1",
  "38": "M5 5h14v14H5z M8 8h.1 M16 8h.1 M12 12h.1 M8 16h.1 M16 16h.1",
  "39": "M12 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M5 20c0-5 3-7 7-7s7 2 7 7z",
  "40": "M12 3l2.5 5.8 6.2.5-4.8 4.1 1.5 6.2L12 16l-5.4 3.6 1.5-6.2L3.3 9.3l6.2-.5z",
  "41": "M8 8h8v8c0 3-2 5-4 5s-4-2-4-5z M8 12H5 M19 12h-3 M7 6l2 2 M17 6l-2 2 M12 9v10",
  "42": "M3 7h18v11H3z M5 9h14v7H5z M12 10v5 M10 11h4 M10 14h4",
  "43": "M2 10h4l2-2h3l1 3 1-3h3l2 2h4 M3 10l1 4h5l2-4 M13 10l2 4h5l1-4",
  "44": "M2 10h4l2-2h3l1 3 1-3h3l2 2h4 M3 10l1 4h5l2-4 M13 10l2 4h5l1-4",
  "45": "M4 13v-2a8 8 0 0 1 16 0v2 M4 12h4v6H5z M16 12h4l-1 6h-3z",
  "46": "M12 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M5 20c0-5 3-7 7-7s7 2 7 7z",
  "47": "M6 6l12 12 M18 6L6 18",
  "48": "M4 3h14l2 2v16H4z M7 3v6h9V3 M7 21v-8h10v8",
  "49": "M12 5v3 M12 16v3 M5 12h3 M16 12h3 M7 7l2 2 M15 15l2 2 M17 7l-2 2 M9 15l-2 2 M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  "50": "M10 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12z M14 14l6 6",
  "51": "M4 8h16v12H4z M8 8V5h8v3 M4 13h16",
  "52": "M12 3l2 6 6 3-6 2-2 7-2-7-6-2 6-3z",
  "53": "M3 12c5-8 13-8 18 0-5 8-13 8-18 0z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  "54": "M4 5h16v11H4z M9 20h6 M12 16v4",
  "55": "M12 12m-9 0a9 3 0 1 0 18 0a9 3 0 1 0-18 0 M6 5c-3 3 4 15 7 14 M18 5c3 3-4 15-7 14 M12 12h.1",
  "56": "M12 5c-3-3-7 0-6 3-3 1-3 5 0 6-1 4 3 6 6 4 3 2 7 0 6-4 3-1 3-5 0-6 1-3-3-6-6-3z M12 5v13 M8 10l4 2 4-2",
  "57": "M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z M9 4v14 M15 6v14",
  "58": "M15 3l-5 9 M10 12l4 3-6 6-5-4z",
  "59": "M3 9l4-5h10l4 5-9 12z M3 9h18 M7 4l5 17 5-17",
  "60": "M7 3h10 M7 21h10 M8 4c0 4 1 6 4 8-3 2-4 4-4 8 M16 4c0 4-1 6-4 8 3 2 4 4 4 8",
  "61": "M3 5h18v14H3z M6 8h6v5H6z M15 8h3 M15 11h3 M6 16h12",
  "62": "M5 10a7 7 0 0 1 12-4l2 2 M19 4v4h-4 M19 14a7 7 0 0 1-12 4l-2-2 M5 20v-4h4",
  "63": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l4 3",
  "64": "M12 21V9 M12 15C4 15 4 9 4 7c5 0 8 2 8 6 M12 11c0-5 4-7 8-7 0 5-2 8-8 9",
  "65": "M2 9l10-5 10 5-10 5z M6 11v5c3 3 9 3 12 0v-5 M21 10v6",
  "66": "M4 6h16v14H4z M8 3v6 M16 3v6 M4 10h16 M8 14h2 M14 14h2",
  "67": "M3 5h2l2 10h11l3-7H6 M9 19h.1 M17 19h.1",
  "68": "M12 3l2 6 6 3-6 2-2 7-2-7-6-2 6-3z",
  "69": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M12 12h.1",
  "70": "M4 20L20 4v16z M10 17h1 M13 14h1 M16 11h1",
  "71": "M4 10h16v10H4z M3 7h18v3H3z M12 7v13 M12 7c-8 0-6-6-3-4 2 1 3 4 3 4 0-4 3-5 4-4 2 2-1 4-4 4z",
  "72": "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z M6 11a6 6 0 0 0 12 0 M12 17v4 M8 21h8",
  "73": "M12 3v5 M5 5l3 3 M3 12h5 M19 5l-3 3 M21 12h-5 M12 10l3 4-3 7-3-7z",
  "74": "M3 20l3-11 6-5 6 5 3 11z M6 9h12 M12 4v16 M9 20v-6h6v6",
  "75": "M7 3h10 M7 21h10 M8 4c0 4 1 6 4 8-3 2-4 4-4 8 M16 4c0 4-1 6-4 8 3 2 4 4 4 8",
  "76": "M4 4l12 12 M16 13l4 4-3 3-4-4 M20 4L8 16 M8 13l-4 4 3 3 4-4",
  "77": "M5 4h13v15H7c-2 0-2 2 0 2h13 M5 4v15 M8 8h7 M8 12h7",
  "78": "M10 17V5l9-2v12 M10 17c0 3-5 4-5 1s5-4 5-1 M19 15c0 3-5 4-5 1s5-4 5-1",
  "79": "M5 15a4 4 0 0 1 1-8 6 6 0 0 1 11 1 4 4 0 0 1 1 7 M8 17l-1 3 M13 17l-1 3 M18 17l-1 3",
  "80": "M12 3a9 9 0 1 0 0 18V3z M12 3a9 9 0 0 1 0 18",
  "81": "M12 3v5 M5 5l3 3 M3 12h5 M19 5l-3 3 M21 12h-5 M12 10l3 4-3 7-3-7z",
  "82": "M5 8h14v10H5z M12 8V5 M10 5h4 M8 12h.1 M16 12h.1 M9 16h6 M3 11v4 M21 11v4",
  "83": "M5 8h14v10H5z M12 8V5 M10 5h4 M8 12h.1 M16 12h.1 M9 16h6 M3 11v4 M21 11v4",
  "84": "M12 4h.1 M7 9l5-2 4 2 M12 7l-1 7-5 5 M11 14l6 5",
  "85": "M9 14l6-6 M7 11l-2 2a4 4 0 0 0 6 6l2-2 M17 13l2-2a4 4 0 0 0-6-6l-2 2",
  "86": "M4 20L9 4 M20 20L15 4 M8 10h8 M6 16h12",
  "87": "M12 21V9 M12 15C4 15 4 9 4 7c5 0 8 2 8 6 M12 11c0-5 4-7 8-7 0 5-2 8-8 9",
  "88": "M4 7h4l2-3h5l2 3h3v12H4z M12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  "89": "M3 9l4-5h10l4 5-9 12z M3 9h18 M7 4l5 17 5-17",
  "90": "M5 12l5 5 9-10",
  "91": "M12 5v3 M12 16v3 M5 12h3 M16 12h3 M7 7l2 2 M15 15l2 2 M17 7l-2 2 M9 15l-2 2 M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  "92": "M12 3l10 18H2z M12 9v5 M12 17v1",
  "93": "M6 10h12v10H6z M8 10V7a4 4 0 0 1 8 0v3 M12 14v3",
  "94": "M9 3h6 M10 3v7l-5 8c-1 2 0 3 2 3h10c2 0 3-1 2-3l-5-8V3 M8 16h8",
  "95": "M12 3a7 7 0 0 0-4 13l-1 4h10l-1-4a7 7 0 0 0-4-13z M9 20h6",
  "96": "M5 12l5 5 9-10",
  "97": "M12 3v17 M5 21h14 M4 7h16 M7 7l-4 7h8z M17 7l-4 7h8z",
  "98": "M8 5v14 M16 5v14",
  "99": "M3 10l12-5v14L3 14z M15 9h4l2 3-2 3h-4 M6 15l2 5h3l-1-5",
  "100": "M8 11l3-6c1-2 3-1 3 1v3h5c2 0 2 2 1 4l-2 5H8z M4 11h4v7H4z",
  "101": "M12 20S3 15 3 9c0-5 6-7 9-2 3-5 9-3 9 2 0 6-9 11-9 11z",
  "102": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8 10h.1 M16 10h.1 M8 15c2 2 6 2 8 0",
  "103": "M4 5h16v11h-9l-4 4v-4H4z M8 10h8 M8 13h5",
  "104": "M4 5v14h16 M6 8l4 3 3-1 6 6",
  "105": "M4 7h4l2-3h5l2 3h3v12H4z M12 10a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  "106": "M5 19l10-10 M13 5l2-2 4 4-2 2-3-1-7 11H4v-3l10-9z",
  "107": "M7 4h10v5c0 4-2 6-5 6s-5-2-5-6z M7 6H4v2c0 3 2 4 4 4 M17 6h3v2c0 3-2 4-4 4 M12 15v5 M8 21h8",
  "108": "M3 20h18 M12 20v-8 M4 12c0-8 16-8 16 0z",
  "109": "M3 5c4-2 7-1 9 1 2-2 5-3 9-1v14c-4-2-7-1-9 1-2-2-5-3-9-1z M12 6v14",
  "110": "M8 11l3-6c1-2 3-1 3 1v3h5c2 0 2 2 1 4l-2 5H8z M4 11h4v7H4z",
  "111": "M4 10h4l5-4v12l-5-4H4z M16 9l5 6 M21 9l-5 6",
  "112": "M5 19l10-10 M13 5l2-2 4 4-2 2-3-1-7 11H4v-3l10-9z",
  "113": "M8 5l11 7-11 7z",
  "114": "M10 17V5l9-2v12 M10 17c0 3-5 4-5 1s5-4 5-1 M19 15c0 3-5 4-5 1s5-4 5-1",
  "115": "M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M9 12l2 2 4-4",
  "116": "M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M9 12l2 2 4-4",
  "117": "M3 6h18v12H3z M3 7l9 7 9-7",
  "118": "M3 7h18v4a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4z M12 8v9",
  "119": "M7 3h10l4 4v10l-4 4H7l-4-4V7z M8 12h8",
  "120": "M5 19l3-6L17 4l3 3-9 9z M5 19l6-3 M15 6l3 3",
  "121": "M3 6h7l2 2h9l-2 11H3z",
  "122": "M3 7h18v11H3z M5 9h14v7H5z M12 10v5 M10 11h4 M10 14h4",
  "123": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 10v6 M12 7h.1",
  "124": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8 10h.1 M16 10h.1 M8 15c2 2 6 2 8 0",
  "125": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8 10h.1 M16 10h.1 M8 15c2 2 6 2 8 0",
  "126": "M4 6h16v14H4z M8 3v6 M16 3v6 M4 10h16 M8 14h2 M14 14h2",
  "127": "M8 4h8l-1 5 3 3-5 1-1 8-1-8-5-1 3-3z",
  "128": "M12 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M5 20c0-5 3-7 7-7s7 2 7 7z",
  "129": "M12 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M5 20c0-5 3-7 7-7s7 2 7 7z",
  "130": "M12 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M5 20c0-5 3-7 7-7s7 2 7 7z",
  "131": "M12 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M5 20c0-5 3-7 7-7s7 2 7 7z",
  "132": "M12 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M5 20c0-5 3-7 7-7s7 2 7 7z",
  "133": "M12 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M5 20c0-5 3-7 7-7s7 2 7 7z",
  "134": "M12 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M5 20c0-5 3-7 7-7s7 2 7 7z",
  "135": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8 10h.1 M16 10h.1 M8 15c2 2 6 2 8 0",
  "136": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8 10h.1 M16 10h.1 M8 15c2 2 6 2 8 0",
  "137": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8 10h.1 M16 10h.1 M8 15c2 2 6 2 8 0",
  "138": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M8 10h.1 M16 10h.1 M8 15c2 2 6 2 8 0",
  "139": "M3 7l5 4 4-7 4 7 5-4-2 12H5z",
  "140": "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M19 5l-2 2 M7 17l-2 2",
  "141": "M5 15a4 4 0 0 1 1-8 6 6 0 0 1 11 1 4 4 0 0 1 1 7 M8 17l-1 3 M13 17l-1 3 M18 17l-1 3",
  "142": "M12 21V9 M12 15C4 15 4 9 4 7c5 0 8 2 8 6 M12 11c0-5 4-7 8-7 0 5-2 8-8 9",
  "143": "M4 5h16v14H4z M8 8v8 M12 8v8 M16 8v8 M6 11h4 M10 14h4 M14 10h4",
  "144": "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  "145": "M3 6h18v12H3z M7 9h10v5H7z M8 16h8",
  "146": "M7 3h10v18H7z M10 6h4 M11 18h2",
  "147": "M3 8h18v8l-4 2-3-3h-4l-3 3-4-2z M7 11h3 M14 11h3",
  "148": "M12 3l2.5 5.8 6.2.5-4.8 4.1 1.5 6.2L12 16l-5.4 3.6 1.5-6.2L3.3 9.3l6.2-.5z",
  "149": "M5 12l5 5 9-10",
  "150": "M6 6l12 12 M18 6L6 18",
  "151": "M5 14l7-7 7 7 M12 7v11",
  "152": "M5 10l7 7 7-7 M12 17V6",
  "153": "M3 9l4-5h10l4 5-9 12z M3 9h18 M7 4l5 17 5-17",
  "154": "M9 4a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M3 20v-1c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5v1z M16 5a3 3 0 0 1 0 6 M17 14c2.5.5 4 2.3 4 5v1h-3"
};

function glyphParts(id) {
  const path = ICON_PATHS[Number(id)];
  const colors = { 3: '#ff9d66', 4: '#41e6ad', 5: '#ffbd56', 6: '#c39bff', 22: '#ffc65c', 28: '#ffe082', 29: '#e9c8a1', 154: '#ffbd56' };
  return { path: `<path d="${path}"/>`, color: colors[id] || '#8ce4f4' };
}

function iconSvg(id) {
  const {path,color}=glyphParts(id);
  return '<svg class="dev-icon-glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g class="dev-icon-mark" style="color:'+color+'">'+path+'</g></svg>';
}

function replaceTextNode(node) {
  const text = node.nodeValue;
  if (!text || !text.includes('[[DE_ICON_')) return;
  const fragment = document.createDocumentFragment();
  let cursor = 0;
  for (const match of text.matchAll(ICON_PATTERN)) {
    fragment.append(document.createTextNode(text.slice(cursor, match.index)));
    const holder = document.createElement('span');
    holder.className = 'dev-icon';
    holder.innerHTML = iconSvg(Number(match[1]));
    fragment.append(holder);
    cursor = match.index + match[0].length;
  }
  fragment.append(document.createTextNode(text.slice(cursor)));
  node.replaceWith(fragment);
}

function scan(node) {
  if (node.nodeType === Node.TEXT_NODE) { replaceTextNode(node); return; }
  if (node.nodeType !== Node.ELEMENT_NODE && node.nodeType !== Node.DOCUMENT_NODE) return;
  if (node.nodeType === Node.ELEMENT_NODE && node.closest?.('.dev-icon-glyph')) return;
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  const pending = [];
  while (walker.nextNode()) if (walker.currentNode.nodeValue.includes('[[DE_ICON_')) pending.push(walker.currentNode);
  pending.forEach(replaceTextNode);
}

const iconCss = document.createElement('style');
iconCss.textContent = '.dev-icon{display:inline-flex;width:1.15em;height:1.15em;vertical-align:-.22em;margin:0 .14em 0 0;align-items:center;justify-content:center;flex:none}.dev-icon-glyph{display:block;width:100%;height:100%;overflow:visible}.dev-icon-mark{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.studio-logo .dev-icon{width:1.15em;height:1.15em;margin:0}.studio-logo .dev-icon-mark{color:#fff!important}.stat-icon{display:inline-flex;align-items:center}.stat-icon .dev-icon{margin:0}';
document.head.append(iconCss);
scan(document);
new MutationObserver(records => records.forEach(record => {
  if (record.type === 'characterData') scan(record.target);
  for (const node of record.addedNodes || []) scan(node);
})).observe(document.documentElement, {subtree:true, childList:true, characterData:true});

// Canvas fallback uses the same custom geometric glyph language.
const originalFillText = CanvasRenderingContext2D.prototype.fillText;
CanvasRenderingContext2D.prototype.fillText = function(text, x, y, maxWidth) {
  const value = String(text); if (!value.includes('[[DE_ICON_')) return originalFillText.call(this,text,x,y,maxWidth);
  const parts = [...value.matchAll(ICON_PATTERN)];
  const pieces=[]; let cursor=0;
  for(const match of parts){pieces.push({text:value.slice(cursor,match.index)});pieces.push({id:Number(match[1])});cursor=match.index+match[0].length;}
  pieces.push({text:value.slice(cursor)});
  const fontSize=Number((this.font.match(/([0-9.]+)px/)||[])[1])||14;
  const total=pieces.reduce((sum,p)=>sum+(p.id?fontSize:this.measureText(p.text).width),0);
  let px=x; if(this.textAlign==='center')px-=total/2; else if(this.textAlign==='right'||this.textAlign==='end')px-=total;
  const top = this.textBaseline === 'middle' ? y-fontSize*.44 : this.textBaseline === 'top' || this.textBaseline === 'hanging' ? y : y-fontSize*.84;
  this.save(); this.textAlign='left';
  for(const p of pieces){if(p.id){drawCanvasGlyph(this,p.id,px,top,fontSize*.88);px+=fontSize;}else{originalFillText.call(this,p.text,px,y,maxWidth);px+=this.measureText(p.text).width;}}
  this.restore();
};
function drawCanvasGlyph(ctx,id,x,y,size){
  const {path,color}=glyphParts(id); const scale=size/24;
  ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale); ctx.lineWidth=1.8; ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;
  const svgPath=path.match(/<path d="([^"]+)"\/>/);
  if(svgPath){const p=new Path2D(svgPath[1]);ctx.strokeStyle=color;ctx.stroke(p);}
  const rects=[...path.matchAll(/<rect x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)" rx="([^"]+)"\/>/g)]; for(const r of rects)ctx.strokeRect(+r[1],+r[2],+r[3],+r[4]);
  const circles=[...path.matchAll(/<circle cx="([^"]+)" cy="([^"]+)" r="([^"]+)"\/>/g)];for(const c of circles){ctx.beginPath();ctx.arc(+c[1],+c[2],+c[3],0,Math.PI*2);ctx.stroke();}
  ctx.restore();
}
window.DevEmpireIcons = Object.freeze({ total: ICON_TOTAL });
