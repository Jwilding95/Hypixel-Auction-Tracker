import { Pipe, PipeTransform } from '@angular/core';
import { IAuctionItem } from '../models/auction.model';

@Pipe({
    name: 'paginate',
    standalone: true
})

export class PaginatePipe implements PipeTransform {
    transform(items: IAuctionItem[], pageNumber: number, itemsPerPage: number): IAuctionItem[] {
        return items.slice(pageNumber * itemsPerPage, (pageNumber + 1) * itemsPerPage);
    }
}