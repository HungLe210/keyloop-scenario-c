const { describe, it, expect } = require('@jest/globals');
const { createActivitySchema } = require('../../../src/schemas/activity.schema');
const { ACTIVITY_TYPE } = require('../../../src/utils/constants');

describe('Activity Schema Validation', () => {
    describe('createActivitySchema - Valid Inputs', () => {
        it('should validate correct activity data with CALL type', async () => {
            const input = {
                params: { leadId: '123' },
                body: {
                    type: 'CALL',
                    note: 'Called customer to discuss requirements'
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.params.leadId).toBe(123); // Transformed to number
            expect(result.body.type).toBe('CALL');
            expect(result.body.note).toBe('Called customer to discuss requirements');
        });

        it('should validate correct activity data with EMAIL type', async () => {
            const input = {
                params: { leadId: '456' },
                body: {
                    type: 'EMAIL',
                    note: 'Sent proposal email'
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.params.leadId).toBe(456);
            expect(result.body.type).toBe('EMAIL');
        });

        it('should validate correct activity data with NOTE type', async () => {
            const input = {
                params: { leadId: '789' },
                body: {
                    type: 'NOTE',
                    note: 'Customer interested in premium package'
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.params.leadId).toBe(789);
            expect(result.body.type).toBe('NOTE');
        });

        it('should accept note with maximum length (2000 characters)', async () => {
            const longNote = 'A'.repeat(2000);
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'NOTE',
                    note: longNote
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.body.note).toHaveLength(2000);
        });

        it('should transform string leadId to integer', async () => {
            const input = {
                params: { leadId: '999' },
                body: {
                    type: 'CALL',
                    note: 'Test note'
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.params.leadId).toBe(999);
            expect(typeof result.params.leadId).toBe('number');
        });
    });

    describe('createActivitySchema - Invalid Activity Type', () => {
        it('should reject invalid activity type', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'INVALID_TYPE',
                    note: 'Test note'
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow(/Invalid option/);
        });

        it('should reject missing activity type', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    note: 'Test note'
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow(/Invalid option/);
        });

        it('should reject null activity type', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: null,
                    note: 'Test note'
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow();
        });

        it('should reject numeric activity type', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 123,
                    note: 'Test note'
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow();
        });

        it('should reject boolean activity type', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: true,
                    note: 'Test note'
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow();
        });
    });

    describe('createActivitySchema - Invalid Note Field', () => {
        it('should reject missing note', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'CALL'
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow(/Invalid input/);
        });

        it('should reject empty note', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'CALL',
                    note: ''
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow(/Note cannot be empty/);
        });

        it('should reject note exceeding 2000 characters', async () => {
            const tooLongNote = 'A'.repeat(2001);
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'CALL',
                    note: tooLongNote
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow(/Note cannot exceed 2000 characters/);
        });

        it('should reject non-string note (number)', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'CALL',
                    note: 12345
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow(/Invalid input/);
        });

        it('should reject non-string note (array)', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'CALL',
                    note: ['This', 'is', 'array']
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow();
        });

        it('should reject non-string note (object)', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'CALL',
                    note: { text: 'object' }
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow();
        });

        it('should reject null note', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'CALL',
                    note: null
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow();
        });
    });

    describe('createActivitySchema - Invalid Lead ID', () => {
        it('should reject non-numeric lead ID', async () => {
            const input = {
                params: { leadId: 'abc' },
                body: {
                    type: 'CALL',
                    note: 'Test note'
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow(/Lead ID must be a positive integer/);
        });

        it('should reject negative lead ID', async () => {
            const input = {
                params: { leadId: '-1' },
                body: {
                    type: 'CALL',
                    note: 'Test note'
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow(/Lead ID must be a positive integer/);
        });

        it('should reject decimal lead ID', async () => {
            const input = {
                params: { leadId: '1.5' },
                body: {
                    type: 'CALL',
                    note: 'Test note'
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow(/Lead ID must be a positive integer/);
        });

        it('should reject lead ID with special characters', async () => {
            const input = {
                params: { leadId: '12@3' },
                body: {
                    type: 'CALL',
                    note: 'Test note'
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow(/Lead ID must be a positive integer/);
        });

        it('should reject empty lead ID', async () => {
            const input = {
                params: { leadId: '' },
                body: {
                    type: 'CALL',
                    note: 'Test note'
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow();
        });
    });

    describe('createActivitySchema - Strict Mode (Extra Fields)', () => {
        it('should reject extra fields in body', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'CALL',
                    note: 'Test note',
                    extraField: 'This should not be here'
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow(/Unrecognized key/);
        });

        it('should reject multiple extra fields in body', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'CALL',
                    note: 'Test note',
                    field1: 'extra',
                    field2: 'also extra'
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow(/Unrecognized key/);
        });

        it('should reject extra fields in params', async () => {
            const input = {
                params: {
                    leadId: '1',
                    extraParam: 'invalid'
                },
                body: {
                    type: 'CALL',
                    note: 'Test note'
                }
            };

            await expect(createActivitySchema.parseAsync(input))
                .rejects
                .toThrow(/Unrecognized key/);
        });
    });

    describe('createActivitySchema - HTML Sanitization', () => {
        it('should strip HTML tags from note', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'CALL',
                    note: '<b>Bold text</b> and <i>italic text</i>'
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.body.note).toBe('Bold text and italic text');
            expect(result.body.note).not.toContain('<b>');
            expect(result.body.note).not.toContain('</b>');
        });

        it('should strip script tags but preserve content', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'NOTE',
                    note: '<script>alert("XSS")</script>Important note'
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            // stripHtml only removes tags, not the content inside
            expect(result.body.note).toContain('Important note');
            expect(result.body.note).not.toContain('<script>');
            expect(result.body.note).not.toContain('</script>');
        });

        it('should strip img tags with onerror XSS', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'NOTE',
                    note: '<img src=x onerror="alert(1)">Customer feedback'
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.body.note).toBe('Customer feedback');
            expect(result.body.note).not.toContain('<img');
            expect(result.body.note).not.toContain('onerror');
        });

        it('should strip anchor tags with javascript protocol', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'EMAIL',
                    note: '<a href="javascript:alert(1)">Click here</a> for details'
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.body.note).toBe('Click here for details');
            expect(result.body.note).not.toContain('<a');
            expect(result.body.note).not.toContain('javascript:');
        });

        it('should decode HTML entities', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'NOTE',
                    note: 'Price &lt; $100 &amp; quality &gt; average'
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.body.note).toBe('Price < $100 & quality > average');
        });

        it('should handle multiple HTML tags and entities', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'NOTE',
                    note: '<div><p>Customer said &quot;yes&quot; to <strong>proposal</strong></p></div>'
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.body.note).toBe('Customer said "yes" to proposal');
        });

        it('should strip nested HTML tags', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'CALL',
                    note: '<div><span><b><i>Nested tags</i></b></span></div> content'
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.body.note).toBe('Nested tags content');
        });

        it('should trim whitespace after HTML stripping', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'NOTE',
                    note: '   <b>Text with spaces</b>   '
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.body.note).toBe('Text with spaces');
            expect(result.body.note).not.toMatch(/^\s/);
            expect(result.body.note).not.toMatch(/\s$/);
        });

        it('should preserve plain text without HTML', async () => {
            const plainText = 'This is a normal note without any HTML tags';
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'CALL',
                    note: plainText
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.body.note).toBe(plainText);
        });
    });

    describe('createActivitySchema - Edge Cases', () => {
        it('should allow empty string after HTML stripping (Zod validates before transform)', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'CALL',
                    note: '<script></script><div></div>'
                }
            };

            // Zod validates min length BEFORE transform, so this passes validation
            // but results in empty string after sanitization
            const result = await createActivitySchema.parseAsync(input);
            expect(result.body.note).toBe('');
        });

        it('should allow whitespace-only note after HTML stripping', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'CALL',
                    note: '<div>   </div><span>  </span>'
                }
            };

            // Zod validates BEFORE transform, so this passes
            // After sanitization, it becomes empty due to trim()
            const result = await createActivitySchema.parseAsync(input);
            expect(result.body.note).toBe('');
        });

        it('should handle Unicode characters in note', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'NOTE',
                    note: 'Customer từ Việt Nam 🇻🇳 interested in product'
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.body.note).toContain('Việt Nam');
            expect(result.body.note).toContain('🇻🇳');
        });

        it('should handle special characters in note', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'EMAIL',
                    note: 'Price: $1,000.00 - Discount: 10% (valid until 2024-12-31)'
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.body.note).toContain('$1,000.00');
            expect(result.body.note).toContain('10%');
        });

        it('should handle newlines and tabs in note', async () => {
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'NOTE',
                    note: 'Line 1\nLine 2\tTabbed content'
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.body.note).toContain('\n');
            expect(result.body.note).toContain('\t');
        });

        it('should sanitize note even when at maximum length', async () => {
            const noteWithHtml = '<b>' + 'A'.repeat(1990) + '</b>';
            const input = {
                params: { leadId: '1' },
                body: {
                    type: 'NOTE',
                    note: noteWithHtml
                }
            };

            const result = await createActivitySchema.parseAsync(input);

            expect(result.body.note).not.toContain('<b>');
            expect(result.body.note.length).toBeLessThanOrEqual(2000);
        });
    });
});
