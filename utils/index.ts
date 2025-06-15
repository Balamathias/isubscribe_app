export const formatDataAmount = (amount: number): string => {
    const DATA_MB_PER_NAIRA = 3.414
    
    const dataAmount = amount * DATA_MB_PER_NAIRA;

    if (dataAmount <= 1.024) {
        return `${dataAmount.toFixed(2)} MB`;
    } else if (dataAmount > 1 && dataAmount <= 1024) {
        return `${dataAmount.toFixed(2)} MB`;
    } else {
        return `${(dataAmount/1000).toFixed(2)} GB`;
    }
}
