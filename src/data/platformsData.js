// Historical availability and game-balance estimates. Retirement is exclusive.
// Market share is a relative sales index, not a measured percentage of a common market.
// DevKit costs and royalty rates are gameplay assumptions, not historical contract quotes.
// Sources: https://www.nintendo.co.jp/ir/en/finance/hard_soft/index.html
// https://www.sony.com/en/SonyInfo/IR/library/corporatereport/CorporateReport2021_E.pdf
// iOS follows the requested 2007 hardware date; the App Store launched in 2008.
// id, name, launch, retirement, kit, royalty, type, audience, peak index, peak age, decline
const rows = [
 ['pc','PC',1982,null,0,0,'Ordenador','Everyone / Mature',.65,12,.01],
 ['g64','Commodore 64',1982,1994,3000,.10,'Microordenador','Everyone',.62,4,.12],
 ['zx_spectrum','ZX Spectrum',1982,1992,2500,.10,'Microordenador','Everyone',.44,3,.13],
 ['msx','MSX',1983,1993,3500,.12,'Microordenador','Everyone',.28,3,.12],
 ['nes','NES / Famicom',1983,1995,15000,.20,'Consola','Everyone',.90,5,.08],
 ['amstrad_cpc','Amstrad CPC',1984,1990,3000,.10,'Microordenador','Everyone',.32,3,.18],
 ['amiga','Commodore Amiga',1985,1996,8000,.12,'Microordenador','Everyone / Mature',.48,5,.12],
 ['master_system','Sega Master System',1985,1996,12000,.18,'Consola','Everyone',.40,4,.12],
 ['atari_7800','Atari 7800',1986,1992,6000,.15,'Consola','Everyone',.18,2,.22],
 ['pc_engine','PC Engine / TurboGrafx-16',1987,1994,18000,.18,'Consola','Everyone',.32,3,.16],
 ['genesis','Sega Mega Drive / Genesis',1988,1997,30000,.18,'Consola','Young / Mature',.72,4,.12],
 ['game_boy','Game Boy',1989,2003,20000,.15,'Portátil','Everyone',.88,5,.05],
 ['lynx','Atari Lynx',1989,1995,15000,.15,'Portátil','Everyone',.13,1,.40],
 ['neo_geo','Neo Geo AES',1990,1997,50000,.25,'Consola Nicho','Mature',.12,2,.18],
 ['snes','Super Nintendo (SNES)',1990,1999,45000,.20,'Consola','Everyone',.82,4,.12],
 ['game_gear','Sega Game Gear',1990,1997,18000,.15,'Portátil','Everyone',.28,2,.20],
 ['3do','3DO Interactive Multiplayer',1993,1996,40000,.10,'Consola','Mature',.12,1,.45],
 ['jaguar','Atari Jaguar',1993,1996,25000,.12,'Consola','Mature',.09,1,.45],
 ['saturn','Sega Saturn',1994,2000,70000,.16,'Consola','Young / Mature',.30,2,.25],
 ['playbox','Sony PlayStation (PS1)',1994,2006,75000,.15,'Consola','Everyone / Mature',.92,5,.07],
 ['virtual_boy','Nintendo Virtual Boy',1995,1996,25000,.15,'Portátil','Everyone',.04,0,.60],
 ['n64','Nintendo 64',1996,2002,80000,.22,'Consola','Everyone',.55,3,.18],
 ['game_boy_color','Game Boy Color',1998,2003,25000,.15,'Portátil','Everyone',.62,2,.18],
 ['dreamcast','Sega Dreamcast',1998,2001,50000,.12,'Consola','Mature',.22,1,.42],
 ['neo_geo_pocket','Neo Geo Pocket Color',1999,2001,15000,.12,'Portátil','Everyone',.07,1,.50],
 ['ps2','Sony PlayStation 2',2000,2013,120000,.15,'Consola','Everyone / Mature',1,5,.06],
 ['gba','Game Boy Advance',2001,2008,40000,.15,'Portátil','Everyone',.76,3,.15],
 ['gamecube','Nintendo GameCube',2001,2007,65000,.18,'Consola','Everyone',.35,2,.20],
 ['xbox','Microsoft Xbox',2001,2006,75000,.15,'Consola','Mature',.38,3,.20],
 ['ngage','N-Gage',2003,2005,20000,.15,'Móvil/Consola','Young',.07,1,.50],
 ['ds','Nintendo DS',2004,2014,80000,.15,'Portátil','Everyone / Casual',.96,5,.08],
 ['psp','Sony PSP',2004,2014,85000,.15,'Portátil','Young / Mature',.60,4,.12],
 ['xbox360','Microsoft Xbox 360',2005,2016,150000,.15,'Consola','Mature',.74,5,.10],
 ['wii','Nintendo Wii',2006,2013,90000,.15,'Consola','Everyone / Casual',.90,3,.17],
 ['ps3','Sony PlayStation 3',2006,2017,180000,.15,'Consola','Everyone / Mature',.74,6,.10],
 ['mobile','Apple iPhone (iOS)',2007,null,10000,.30,'Móvil','Everyone / Casual',.80,8,.005],
 ['android','Google Android',2008,null,5000,.30,'Móvil','Everyone / Casual',.85,8,.005],
 ['3ds','Nintendo 3DS',2011,2020,100000,.15,'Portátil','Everyone',.66,4,.14],
 ['vita','PlayStation Vita',2011,2019,90000,.15,'Portátil','Young / Mature',.20,2,.32],
 ['wii_u','Nintendo Wii U',2012,2017,80000,.15,'Consola','Everyone',.19,2,.37],
 ['ps4','Sony PlayStation 4',2013,2025,220000,.15,'Consola','Everyone / Mature',.94,5,.08],
 ['xbox_one','Microsoft Xbox One',2013,2021,200000,.15,'Consola','Mature',.49,4,.15],
 ['vrhelmet','Oculus Rift / VR PC',2016,null,40000,.20,'VR','Enthusiast / Mature',.16,4,.03],
 ['ninswitch','Nintendo Switch',2017,null,160000,.15,'Híbrida','Everyone',.95,5,.04],
 ['ps5','Sony PlayStation 5',2020,null,350000,.15,'Consola','Everyone / Mature',.82,5,.03],
 ['xbox_series','Xbox Series X / Series S',2020,null,320000,.15,'Consola','Mature',.46,4,.04],
 ['steam_deck','Valve Steam Deck',2022,null,0,.10,'PC Portátil','Gamer / Mature',.25,4,.03],
 ['quest','Meta Quest (Standalone VR)',2020,null,50000,.30,'VR','Everyone / Mature',.25,4,.04],
 ['switch2','Nintendo Switch 2',2025,null,250000,.15,'Híbrida','Everyone',.80,5,.04]
];
const icons = { 'Ordenador':'💻', 'Microordenador':'💻', 'Consola':'🎮', 'Consola Nicho':'🎮', 'Portátil':'🕹️', 'Móvil/Consola':'📱', 'Móvil':'📱', 'VR':'🥽', 'Híbrida':'🎮', 'PC Portátil':'🕹️' };
export const PLATFORMS_DATABASE = rows.map(([id,name,releaseYear,retireYear,devKitCost,royaltyRate,type,audience,peakShare,peakAge,decline]) => ({
 id,name,releaseYear,retireYear,devKitCost,devCost:devKitCost,royaltyRate,royalty:royaltyRate,type,audience,
 icon:icons[type], audienceFit:{ Everyone: audience.includes('Everyone') ? 1.15 : .95, Young: audience.includes('Young') ? 1.15 : 1, Mature: audience.includes('Mature') ? 1.15 : .9 },
 peakShare,peakAge,decline
}));

// Indices rise to their peak, then decay; retired systems retain a residual audience.
export function getMarketShare(platform, year) {
 if (year < platform.releaseYear) return 0;
 const age = year - platform.releaseYear;
 const peakAge = platform.peakAge;
 const rise = peakAge === 0 ? 1 : .35 + .65 * Math.min(age / peakAge, 1);
 const decline = Math.exp(-platform.decline * Math.max(0, age - peakAge));
 return Math.max(.005, Math.min(1, platform.peakShare * rise * decline));
}

// Includes retired platforms so the UI can explain why they are unavailable.
export function getPlatformsByYear(year) {
 if (!Number.isFinite(Number(year))) return [];
 return PLATFORMS_DATABASE.filter(p => Number(year) >= p.releaseYear).map(p => ({
  ...p, marketShare:getMarketShare(p, Number(year)),
  status:p.retireYear !== null && Number(year) >= p.retireYear ? 'RETIRED' : 'ACTIVE'
 }));
}
export default PLATFORMS_DATABASE;
