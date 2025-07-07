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



export function getGreeting(name?: string): string {
  const now = new Date();
  const hours = now.getHours();
  const day = now.getDate();
  const month = now.getMonth();

  let greeting: string

  if (month === 11 && day === 25) {
      greeting = `Merry Christmas`;
  }
  if (month === 0 && day === 1) {
      greeting = `Happy New Year`;
  }

  if (hours >= 5 && hours < 12) {
      greeting = `Good morning`;
  } else if (hours >= 12 && hours < 15) {
      greeting = `Good afternoon`;
  } else if (hours >= 15 && hours < 21) {
      greeting = `Good evening`;
  } else {
      greeting = `Hi`;
  }

  return name ? greeting + ' ' + name : greeting
}

