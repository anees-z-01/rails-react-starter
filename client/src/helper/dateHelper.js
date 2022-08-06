export const dateHelper = (date) => {
    const dt = new Date(date)
    return dt.toUTCString()
}