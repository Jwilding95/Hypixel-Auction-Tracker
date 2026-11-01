import { Directive, ElementRef, HostBinding, HostListener } from '@angular/core';

/**
 * Makes a click-only element (e.g. a mat-icon or td used as a button)
 * keyboard-operable by adding a button role/tabindex and firing its
 * existing (click) handler on Enter/Space.
 */
@Directive({
  selector: '[appClickable]',
  standalone: true,
})
export class ClickableDirective {

  @HostBinding('attr.role') role = 'button';
  @HostBinding('attr.tabindex') tabindex = 0;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  onKeydownActivate(event: KeyboardEvent): void { 
    event.preventDefault();
    this.elementRef.nativeElement.click();
  }
}
