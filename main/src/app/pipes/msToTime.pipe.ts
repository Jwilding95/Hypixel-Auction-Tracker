import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'msToTime',
    standalone: true,
    pure: true
})

export class MsToTimePipe implements PipeTransform {
    transform(endTimeMs: number, now: number): string {
        const ms = endTimeMs - now;
        if (ms <= 0) { return "FINISHED" }
        let seconds: string = `${Math.floor((ms / 1000) % 60)}`;
        let minutes: string = `${Math.floor((ms / (1000 * 60)) % 60)}`;
        let hours: string = `${Math.floor((ms / (1000 * 60 * 60)) % 24)}`;
        return [hours, minutes, seconds].map(e => e.padStart(2, "0")).join(":");
    }
}