export const NumberFormatter = (value) => {
    if (value < 0) {
        return '-' + NumberFormatter(-value);
    }
    if (value >= 10000000) {
        return (value).toFixed(2);
    } else if (value >= 100000) {
        return (value).toFixed(2);
    } else if (value >= 1000) {
        return (value).toFixed(2);
    } else {
        return value.toString();
    }
}

export const MillionFormatter = (value) => {
    return (value).toFixed(2) + 'M';
};

