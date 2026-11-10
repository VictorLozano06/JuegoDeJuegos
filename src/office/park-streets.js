// Street dimensions shared by road tiles, terrain, and planted areas.
export const PARK_STREET_TILE = 5.2;
export const PARK_STREET = PARK_STREET_TILE * 5;
export const PARK_BYPASS = PARK_STREET_TILE * 10;
export const PARK_SIDEWALK_HALF = 3.625;
export const PARKING_LOT = {
    x: 18,
    z: PARK_STREET - PARK_SIDEWALK_HALF - 4.25 / 2,
    width: 8.4,
    depth: 4.25
};
