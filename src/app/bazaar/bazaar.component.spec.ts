import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BazaarComponent } from './bazaar.component';

describe('BazaarComponent', () => {
  let component: BazaarComponent;
  let fixture: ComponentFixture<BazaarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BazaarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BazaarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
