import { Pipe, PipeTransform } from '@angular/core';

const escapeHtml = (s: string): string =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

@Pipe({
    name: 'loreTransform',
    standalone: true,
    pure: true
})

export class LoreTransformPipe implements PipeTransform {
    /**
     * Transforms an item's lore text to replace minecraft's color/format codes
     * with a respective css class, inserting the item's name to the start,
     * and wrapping each element in a span
     * @param { string } name - Name of the item
     * @param { string } lore - Lore of the item
     * @returns { string } - A string of span elements, joined by a separator of
     * "<br>""
     */
    transform(name: string, lore: string): string {
        const codeRegex = /§.{1}/g
        const colorCodePositiveLookaheadRegex = /(?=§[0-9a-f])/g

        const lines = lore.split("\n");
        const tierCode = lines[lines.length - 1].match(/(?<=§)[0-9a-f]/) || "f";
        const formattedName = `<span class="item-card-${tierCode}">${escapeHtml(name)}</span>`
        const formattedLines = lines.map(line => {
            return line.split(colorCodePositiveLookaheadRegex).map(linePart => {
                const mappedCodes = linePart.match(codeRegex)?.map(code => `item-card-${code[1]}`) || [];
                const text = escapeHtml(linePart.replace(codeRegex, ""));
                return `<span${mappedCodes ? ` class="${mappedCodes.join(" ")}"` : ""}>${text}</span>`
            }).join("")
        }).join("<br>");

        return [formattedName, formattedLines].join("<br>")
    }
}
