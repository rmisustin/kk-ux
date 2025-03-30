
type UnitDesc = {
    label: string,
    divisor: number,
    min: number
};

export interface SelectValue {
    label: string,
    value: number
};

const unitDescMap = new Map<string, UnitDesc[]>([
    ['V', [
        {label: 'gallon', divisor: 24 * 3 * 16 * 16, min: 24 * 3 * 16 * 16},
        {label: 'quart',  divisor: 24 * 3 * 16 * 4,  min: 24 * 3 * 16 * 4},
        {label: 'cup',    divisor: 24 * 3 * 16,      min: 24 * 3 * 4}, // 1/4 cup!
        {label: 'tbsp',   divisor: 24 * 3,           min: 24 * 3},
        {label: 'tsp',    divisor: 24,               min: 0}
    ]],
    ['W', [
        {label: 'lb',     divisor: 8 * 16,           min: 8 * 16},
        {label: "oz",     divisor: 8,                min: 0}
    ]]
]);

export const unitSelectMap = ((m) => {
    let selmap = new Map<string, SelectValue[]>();
    unitDescMap.forEach((v, k) => selmap.set(k, [...v].reverse().map((u) => ({label: u.label, value: u.divisor}))));
    return selmap;
})(unitDescMap);

export function recipeAmount(domain: string, amount: number, html : boolean = true) : {amt:string, units:string, divisor:number} {
    const unitDescs = unitDescMap.get(domain);
    if (unitDescs) {
        for (const desc of unitDescs) {
            if (amount >= desc.min)
                return stringifyQty(desc.label, amount, desc.divisor, html);
        }
    }
    return {amt: amount?.toString(), units: "", divisor: 1};
}

export function recipeQty(domain: string, amount: number, html : boolean = true) {
    return recipeAmount(domain, amount, html).amt;
}

export function recipeUnits(domain: string, amount: number) {
    return recipeAmount(domain, amount).units;
}

export function recipeDivisor(domain: string, amount: number) {
    return recipeAmount(domain, amount).divisor;
}

function stringifyQty(units: string, amount: number, divisor: number, html : boolean) : {amt: string, units: string, divisor: number} {
    const whole = ~~(amount / divisor);
    const remainder = amount % divisor;
    if (remainder) {
        const c = gcd(remainder, divisor);
        const amt = (whole ? whole.toString() + (html ? "&nbsp" : " ") : "") +
                    (~~(remainder / c)).toString() + (html ? "&frasl;" : "/") + (~~(divisor / c)).toString();
        return {amt, units, divisor};
    }
    return {amt: whole.toString(), units, divisor};
}

function gcd(a: number, b: number): number {
    if (b === 0) {
        return a;
    }
    return gcd(b, a % b);
}

export function parseAmount(textAmt : string, divisor : number = 1): number {
    const nums = textAmt.trim().match(/^(?:(\d+)(?:\s+|$))?(?:(\d+)\/(\d+))?$/);
    let value = 0;
    if (nums) {
        if (nums[1]) {
            value += divisor * ~~nums[1];
        }
        if (nums[2]) {
            value += ~~((divisor * ~~nums[2]) / ~~nums[3]);
        }
        return value;
    }
    return -1;
}