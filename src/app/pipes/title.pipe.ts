import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'title',
    standalone: true
})

export class TitlePipe implements PipeTransform {
    transform(str: any): any {
        if (typeof str !== 'string') {
            return str;
        }
        return str === "BIN" ? str : str.toLowerCase().replace(/(^|\s)\S/g, e => e.toUpperCase());
    }
}