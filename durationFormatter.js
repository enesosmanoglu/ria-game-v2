let ex = {};
const GREGORIAN_YEAR_DAYS = 365.242500;
ex.DUR_MS = 1;
ex.DUR_S = 1000 * ex.DUR_MS;
ex.DUR_M = 60 * ex.DUR_S;
ex.DUR_H = 60 * ex.DUR_M;
ex.DUR_D = 24 * ex.DUR_H;
ex.DUR_W = 7 * ex.DUR_D;
ex.DUR_MO = GREGORIAN_YEAR_DAYS / 12 * ex.DUR_D;
ex.DUR_Y = GREGORIAN_YEAR_DAYS * ex.DUR_D;
const Units = [
    ['y', ex.DUR_Y],
    ['mo', ex.DUR_MO],
    ['w', ex.DUR_W],
    ['d', ex.DUR_D],
    ['h', ex.DUR_H],
    ['m', ex.DUR_M],
    ['s', ex.DUR_S],
    ['ms', ex.DUR_MS],
];
const defaultOptions = {
    allowMultiples: ['y', 'mo', 'd', 'h', 'm', 's'],
    keepNonLeadingZeroes: false,
    render(parts) {
        return parts.map(({ literal, symbol }) => `${literal}${symbol}`).join(' ');
    },
};
function durationFormatter(options) {
    const opt = Object.assign({}, defaultOptions, options);
    const allowMultiples = new Set(opt.allowMultiples.map(a => a.toLowerCase()));
    return function (n) {
        const parts = [];
        const short = { literal: '0', symbol: 'ms' };
        let sign = '';
        if (n < 0) {
            sign = '−';
            n = -n;
        }
        for (const [a, b] of Units) {
            if (allowMultiples.has(a)) {
                if (n >= b) {
                    parts.push({ literal: '' + Math.floor(n / b), symbol: a });
                    n %= b;
                }
                else if (!parts.length) {
                    short.symbol = a;
                }
                else if (opt.keepNonLeadingZeroes) {
                    parts.push({ literal: '0', symbol: a });
                }
            }
        }
        if (sign && parts.length && parts[0].literal != '0') {
            parts[0].literal = sign + parts[0].literal;
        }
        return opt.render(parts.length ? parts : [short]);
    };
}

export default durationFormatter();