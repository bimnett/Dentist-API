async function formatTimestamp(){
    const timestamp = Date.now(); // Current timestamp in milliseconds
    const date = new Date(timestamp); // Convert timestamp to a Date object

    // Extract year, month, and day
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-based, add 1
    const day = String(date.getDate()).padStart(2, '0');

    // Extract hours, minutes, and seconds
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Format the full date and time as YYYY-MM-DD HH:MM:SS
    const formattedTimestamp = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return formattedTimestamp;
};

module.exports = {
    formatTimestamp
}