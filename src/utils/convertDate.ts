export function convertTimestampToMMDDYYYY(timestamp: string | number | Date) {
    // Create a Date object from the timestamp
    const date = new Date(timestamp);

    // Extract month, day, and year
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() returns 0-11
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();

    // Return in MM/DD/YYYY format
    return `${month}/${day}/${year}`;
}