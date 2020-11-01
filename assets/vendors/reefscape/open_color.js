//
//	Javascript library to pick colors from the Open Color palette
//
//	palette by https://yeun.github.io/open-color/
//	Javascript by https://reefscape.net
//
//	MIT License
//

OC_GRAY = 0;
OC_RED = 1;
OC_PINK = 2;
OC_GRAPE = 3;
OC_VIOLET = 4;
OC_INDIGO = 5;
OC_BLUE = 6;
OC_CYAN = 7;
OC_TEAL = 8;
OC_GREEN = 9;
OC_LIME = 10;
OC_YELLOW = 11;
OC_ORANGE = 12;

OC_LIGHTEST = 0;
OC_LIGHTER = 1;
OC_LIGHT = 2;
OC_MID_LIGHT = 3;
OC_MID = 4;
OC_MID_DARK = 5;
OC_DARK = 6;
OC_DARKER = 7;
OC_DARKEST = 8;


OC_NR_COLORS = 13;
OC_NR_SHADES = 9;

OC_COLORS = [];

OC_COLORS[OC_GRAY] = [
    '#f8f9fa',
    '#f1f3f5',
    '#e9ecef',
    '#dee2e6',
    '#ced4da',
    '#adb5bd',
    '#868e96',
    '#495057',
    '#343a40',
    '#212529'
];

OC_COLORS[OC_RED] = [
    '#fff5f5',
    '#ffe3e3',
    '#ffc9c9',
    '#ffa8a8',
    '#ff8787',
    '#ff6b6b',
    '#fa5252',
    '#f03e3e',
    '#e03131',
    '#c92a2a'
];

OC_COLORS[OC_PINK] = [
    '#fff0f6',
    '#ffdeeb',
    '#fcc2d7',
    '#faa2c1',
    '#f783ac',
    '#f06595',
    '#e64980',
    '#d6336c',
    '#c2255c',
    '#a61e4d'
];

OC_COLORS[OC_GRAPE] = [
    '#f8f0fc',
    '#f3d9fa',
    '#eebefa',
    '#e599f7',
    '#da77f2',
    '#cc5de8',
    '#be4bdb',
    '#ae3ec9',
    '#9c36b5',
    '#862e9c'
];

OC_COLORS[OC_VIOLET] = [
    '#f3f0ff',
    '#e5dbff',
    '#d0bfff',
    '#b197fc',
    '#9775fa',
    '#845ef7',
    '#7950f2',
    '#7048e8',
    '#6741d9',
    '#5f3dc4'
];

OC_COLORS[OC_INDIGO] = [
    '#edf2ff',
    '#dbe4ff',
    '#bac8ff',
    '#91a7ff',
    '#748ffc',
    '#5c7cfa',
    '#4c6ef5',
    '#4263eb',
    '#3b5bdb',
    '#364fc7'
];

OC_COLORS[OC_BLUE] = [
    '#e7f5ff',
    '#d0ebff',
    '#a5d8ff',
    '#74c0fc',
    '#4dabf7',
    '#339af0',
    '#228be6',
    '#1c7ed6',
    '#1971c2',
    '#1864ab'
];

OC_COLORS[OC_CYAN] = [
    '#e3fafc',
    '#c5f6fa',
    '#99e9f2',
    '#66d9e8',
    '#3bc9db',
    '#22b8cf',
    '#15aabf',
    '#1098ad',
    '#0c8599',
    '#0b7285'
];

OC_COLORS[OC_TEAL] = [
    '#e6fcf5',
    '#c3fae8',
    '#96f2d7',
    '#63e6be',
    '#38d9a9',
    '#20c997',
    '#12b886',
    '#0ca678',
    '#099268',
    '#087f5b'
];

OC_COLORS[OC_GREEN] = [
    '#ebfbee',
    '#d3f9d8',
    '#b2f2bb',
    '#8ce99a',
    '#69db7c',
    '#51cf66',
    '#40c057',
    '#37b24d',
    '#2f9e44',
    '#2b8a3e'
];

OC_COLORS[OC_LIME] = [
    '#f4fce3',
    '#e9fac8',
    '#d8f5a2',
    '#c0eb75',
    '#a9e34b',
    '#94d82d',
    '#82c91e',
    '#74b816',
    '#66a80f',
    '#5c940d'
];

OC_COLORS[OC_YELLOW] = [
    '#fff9db',
    '#fff3bf',
    '#ffec99',
    '#ffe066',
    '#ffd43b',
    '#fcc419',
    '#fab005',
    '#f59f00',
    '#f08c00',
    '#e67700'
];

OC_COLORS[OC_ORANGE] = [
    '#fff4e6',
    '#ffe8cc',
    '#ffd8a8',
    '#ffc078',
    '#ffa94d',
    '#ff922b',
    '#fd7e14',
    '#f76707',
    '#e8590c',
    '#d9480f'
];


//
//	pick a color based on the color range and the shade
//
function OC_pick(colorRange, colorShade) {
    var newColor = "#FF0000";

    if (colorRange >= 0 && colorRange < OC_NR_COLORS && colorShade >= 0 && colorShade < OC_NR_SHADES) {
        newColor = OC_COLORS[colorRange][colorShade];
    } else {
        console.log('OPEN COLOR INPUT ERROR: ',colorRange,colorShade);
    }

    return newColor;
}

//
//	pick a random color
//
function OC_random() {
    var colorRange = Math.floor(Math.random(0)*OC_NR_COLORS);
    var colorShade = Math.floor(Math.random(0)*OC_NR_SHADES);

    return OC_pick(colorRange,colorShade);
}