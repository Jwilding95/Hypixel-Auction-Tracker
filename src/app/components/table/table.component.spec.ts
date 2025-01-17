import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableComponent } from './table.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AuctionsService } from '../../services/auctions/auctions.service';


describe('TableComponent', () => {
  let component: TableComponent;
  let fixture: ComponentFixture<TableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableComponent, HttpClientTestingModule],
      providers: [AuctionsService]
    }).compileComponents();
    
    fixture = TestBed.createComponent(TableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
