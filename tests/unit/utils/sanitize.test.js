const { describe, it, expect } = require('@jest/globals');
const sanitize = require('../../../src/utils/sanitize');

describe('Sanitization Utilities', () => {
    describe('stripHtml', () => {
        describe('Basic HTML Stripping', () => {
            it('should strip simple HTML tags', () => {
                const result = sanitize.stripHtml('<b>Bold text</b>');
                expect(result).toBe('Bold text');
            });

            it('should strip multiple HTML tags', () => {
                const result = sanitize.stripHtml('<b>Bold</b> and <i>italic</i>');
                expect(result).toBe('Bold and italic');
            });

            it('should strip nested HTML tags', () => {
                const result = sanitize.stripHtml('<div><span><b>Nested</b></span></div>');
                expect(result).toBe('Nested');
            });

            it('should preserve plain text without HTML', () => {
                const plainText = 'This is plain text';
                const result = sanitize.stripHtml(plainText);
                expect(result).toBe(plainText);
            });

            it('should return empty string for HTML-only input', () => {
                const result = sanitize.stripHtml('<div></div><span></span>');
                expect(result).toBe('');
            });
        });

        describe('XSS Prevention', () => {
            it('should strip script tags but keep content', () => {
                const result = sanitize.stripHtml('<script>alert("XSS")</script>Safe text');
                expect(result).toContain('Safe text');
                expect(result).not.toContain('<script>');
                expect(result).not.toContain('</script>');
                // Note: stripHtml removes tags but not the content inside them
            });

            it('should strip img tags with onerror', () => {
                const result = sanitize.stripHtml('<img src=x onerror="alert(1)">Text');
                expect(result).toBe('Text');
                expect(result).not.toContain('<img');
                expect(result).not.toContain('onerror');
            });

            it('should strip anchor tags with javascript protocol', () => {
                const result = sanitize.stripHtml('<a href="javascript:alert(1)">Click</a>');
                expect(result).toBe('Click');
                expect(result).not.toContain('<a');
                expect(result).not.toContain('javascript:');
            });

            it('should strip iframe tags', () => {
                const result = sanitize.stripHtml('<iframe src="evil.com"></iframe>Content');
                expect(result).toBe('Content');
                expect(result).not.toContain('<iframe');
            });

            it('should strip style tags but keep content', () => {
                const result = sanitize.stripHtml('<style>body{display:none}</style>Text');
                expect(result).toContain('Text');
                expect(result).not.toContain('<style>');
                expect(result).not.toContain('</style>');
            });

            it('should strip event handlers', () => {
                const result = sanitize.stripHtml('<div onclick="alert(1)">Click me</div>');
                expect(result).toBe('Click me');
                expect(result).not.toContain('onclick');
            });
        });

        describe('HTML Entity Decoding', () => {
            it('should decode &lt; entity', () => {
                const result = sanitize.stripHtml('Price &lt; $100');
                expect(result).toBe('Price < $100');
            });

            it('should decode &gt; entity', () => {
                const result = sanitize.stripHtml('Quality &gt; average');
                expect(result).toBe('Quality > average');
            });

            it('should decode &amp; entity', () => {
                const result = sanitize.stripHtml('Tom &amp; Jerry');
                expect(result).toBe('Tom & Jerry');
            });

            it('should decode &quot; entity', () => {
                const result = sanitize.stripHtml('He said &quot;hello&quot;');
                expect(result).toBe('He said "hello"');
            });

            it('should decode &#x27; entity (single quote)', () => {
                const result = sanitize.stripHtml('It&#x27;s working');
                expect(result).toBe("It's working");
            });

            it('should decode &#x2F; entity (forward slash)', () => {
                const result = sanitize.stripHtml('Path: home&#x2F;user');
                expect(result).toBe('Path: home/user');
            });

            it('should decode multiple entities', () => {
                const result = sanitize.stripHtml('&lt;div&gt; &amp; &quot;text&quot;');
                expect(result).toBe('<div> & "text"');
            });
        });

        describe('Whitespace Handling', () => {
            it('should trim leading whitespace', () => {
                const result = sanitize.stripHtml('   Text');
                expect(result).toBe('Text');
            });

            it('should trim trailing whitespace', () => {
                const result = sanitize.stripHtml('Text   ');
                expect(result).toBe('Text');
            });

            it('should trim both leading and trailing whitespace', () => {
                const result = sanitize.stripHtml('   Text   ');
                expect(result).toBe('Text');
            });

            it('should trim whitespace after HTML stripping', () => {
                const result = sanitize.stripHtml('   <b>Text</b>   ');
                expect(result).toBe('Text');
            });

            it('should preserve internal whitespace', () => {
                const result = sanitize.stripHtml('Word1   Word2');
                expect(result).toBe('Word1   Word2');
            });

            it('should preserve newlines', () => {
                const result = sanitize.stripHtml('Line1\nLine2');
                expect(result).toBe('Line1\nLine2');
            });

            it('should preserve tabs', () => {
                const result = sanitize.stripHtml('Col1\tCol2');
                expect(result).toBe('Col1\tCol2');
            });
        });

        describe('Edge Cases', () => {
            it('should handle empty string', () => {
                const result = sanitize.stripHtml('');
                expect(result).toBe('');
            });

            it('should handle malformed HTML', () => {
                const result = sanitize.stripHtml('<b>Unclosed tag');
                expect(result).toBe('Unclosed tag');
            });

            it('should handle HTML with no closing tags', () => {
                const result = sanitize.stripHtml('<br><hr>Text');
                expect(result).toBe('Text');
            });

            it('should handle self-closing tags', () => {
                const result = sanitize.stripHtml('Text <img /> more text');
                expect(result).toBe('Text  more text');
            });

            it('should handle tags with attributes', () => {
                const result = sanitize.stripHtml('<div class="test" id="main">Content</div>');
                expect(result).toBe('Content');
            });

            it('should handle Unicode characters', () => {
                const result = sanitize.stripHtml('Tiếng Việt 🇻🇳');
                expect(result).toBe('Tiếng Việt 🇻🇳');
            });

            it('should handle special characters', () => {
                const result = sanitize.stripHtml('Price: $100 (10% off)');
                expect(result).toBe('Price: $100 (10% off)');
            });

            it('should handle very long strings', () => {
                const longText = 'A'.repeat(10000);
                const result = sanitize.stripHtml(longText);
                expect(result).toBe(longText);
            });

            it('should handle mixed HTML and entities', () => {
                const result = sanitize.stripHtml('<b>Bold &amp; &lt;italic&gt;</b>');
                expect(result).toBe('Bold & <italic>');
            });
        });

        describe('Non-String Inputs', () => {
            it('should return non-string input as-is (number)', () => {
                const result = sanitize.stripHtml(123);
                expect(result).toBe(123);
            });

            it('should return non-string input as-is (null)', () => {
                const result = sanitize.stripHtml(null);
                expect(result).toBe(null);
            });

            it('should return non-string input as-is (undefined)', () => {
                const result = sanitize.stripHtml(undefined);
                expect(result).toBe(undefined);
            });

            it('should return non-string input as-is (object)', () => {
                const obj = { key: 'value' };
                const result = sanitize.stripHtml(obj);
                expect(result).toBe(obj);
            });

            it('should return non-string input as-is (array)', () => {
                const arr = [1, 2, 3];
                const result = sanitize.stripHtml(arr);
                expect(result).toBe(arr);
            });
        });
    });

    describe('trim', () => {
        it('should trim leading whitespace', () => {
            const result = sanitize.trim('   text');
            expect(result).toBe('text');
        });

        it('should trim trailing whitespace', () => {
            const result = sanitize.trim('text   ');
            expect(result).toBe('text');
        });

        it('should trim both leading and trailing whitespace', () => {
            const result = sanitize.trim('   text   ');
            expect(result).toBe('text');
        });

        it('should preserve internal whitespace', () => {
            const result = sanitize.trim('  word1  word2  ');
            expect(result).toBe('word1  word2');
        });

        it('should handle empty string', () => {
            const result = sanitize.trim('');
            expect(result).toBe('');
        });

        it('should handle whitespace-only string', () => {
            const result = sanitize.trim('     ');
            expect(result).toBe('');
        });

        it('should return non-string input as-is', () => {
            expect(sanitize.trim(123)).toBe(123);
            expect(sanitize.trim(null)).toBe(null);
            expect(sanitize.trim(undefined)).toBe(undefined);
        });
    });

    describe('array', () => {
        it('should sanitize array of strings with stripHtml (default)', () => {
            const input = ['<b>Text1</b>', '<i>Text2</i>'];
            const result = sanitize.array(input);
            expect(result).toEqual(['Text1', 'Text2']);
        });

        it('should sanitize array of strings with trim method', () => {
            const input = ['  text1  ', '  text2  '];
            const result = sanitize.array(input, 'trim');
            expect(result).toEqual(['text1', 'text2']);
        });

        it('should handle empty array', () => {
            const result = sanitize.array([]);
            expect(result).toEqual([]);
        });

        it('should handle array with mixed content', () => {
            const input = ['<b>Bold</b>', 'Plain', '<script>alert(1)</script>Safe'];
            const result = sanitize.array(input);
            expect(result[0]).toBe('Bold');
            expect(result[1]).toBe('Plain');
            expect(result[2]).toContain('Safe');
            expect(result[2]).not.toContain('<script>');
        });

        it('should return non-array input as-is', () => {
            expect(sanitize.array('string')).toBe('string');
            expect(sanitize.array(123)).toBe(123);
            expect(sanitize.array(null)).toBe(null);
        });
    });
});
