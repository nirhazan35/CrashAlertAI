describe('Date Formatting Utilities', () => {
    describe('formatDate', () => {
        it('should format date correctly', () => {
            const date = new Date('2024-03-15T10:30:00');
            const formatted = global.formatDate(date);
            expect(formatted).toBe('15/03/2024 10:30');
        });

        it('should handle single digit day and month', () => {
            const date = new Date('2024-01-05T09:05:00');
            const formatted = global.formatDate(date);
            expect(formatted).toBe('05/01/2024 09:05');
        });

        it('should handle midnight', () => {
            const date = new Date('2024-03-15T00:00:00');
            const formatted = global.formatDate(date);
            expect(formatted).toBe('15/03/2024 00:00');
        });
    });

    describe('parseDate', () => {
        it('should parse formatted date string correctly', () => {
            const dateStr = '15/03/2024 10:30';
            const parsed = global.parseDate(dateStr);
            expect(parsed).toBeInstanceOf(Date);
            expect(parsed.getDate()).toBe(15);
            expect(parsed.getMonth()).toBe(2); // March is 2 (0-based)
            expect(parsed.getFullYear()).toBe(2024);
            expect(parsed.getHours()).toBe(10);
            expect(parsed.getMinutes()).toBe(30);
        });

        it('should handle single digit day and month', () => {
            const dateStr = '05/01/2024 09:05';
            const parsed = global.parseDate(dateStr);
            expect(parsed.getDate()).toBe(5);
            expect(parsed.getMonth()).toBe(0); // January is 0
            expect(parsed.getFullYear()).toBe(2024);
            expect(parsed.getHours()).toBe(9);
            expect(parsed.getMinutes()).toBe(5);
        });

        it('should handle midnight', () => {
            const dateStr = '15/03/2024 00:00';
            const parsed = global.parseDate(dateStr);
            expect(parsed.getHours()).toBe(0);
            expect(parsed.getMinutes()).toBe(0);
        });
    });
}); 