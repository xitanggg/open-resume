/**
 * Formats a URL string to ensure it has a valid protocol.
 * 
 * @param input - The URL string to format
 * @returns A properly formatted URL string:
 * - Returns empty string if input is undefined or invalid
 * - Returns the full URL if input is a valid URL
 * - Adds 'https://' prefix for simple domain names (e.g., 'example.com')
 */
export function formatUrl(input: string | undefined): string {
    if (!input) {
        return '';
    }

    const trimmedInput = input.trim();

    try {
        const url = new URL(trimmedInput);
        return url.href;
    } catch (error) {
        if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/.test(trimmedInput)) {
            return `https://${trimmedInput}`;
        }
    }

    return '';
}
