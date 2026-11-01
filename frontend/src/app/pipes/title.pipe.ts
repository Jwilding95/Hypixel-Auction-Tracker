import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'title',
    standalone: true
})

export class TitlePipe implements PipeTransform {
    transform(value: string | number): string {
        if (typeof value !== 'string') {
            return String(value);
        }
        return value === "BIN" ? value : value.toLowerCase().replace(/(^|\s)\S/g, e => e.toUpperCase());
    }
}