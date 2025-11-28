export const formatRelativeTime = (timestamp: string | Date): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) {
        return '방금 전';
    }
    if (diffSeconds < 3600) { // Less than 1 hour
        return `${Math.floor(diffSeconds / 60)}분 전`;
    }
    if (diffSeconds < 86400) { // Less than 24 hours
        return `${Math.floor(diffSeconds / 3600)}시간 전`;
    }
    if (diffSeconds < 2592000) { // Less than 30 days
        return `${Math.floor(diffSeconds / 86400)}일 전`;
    }
    // Fallback for older dates, could be improved with year/month if needed
    return date.toLocaleDateString('ko-KR');
};
