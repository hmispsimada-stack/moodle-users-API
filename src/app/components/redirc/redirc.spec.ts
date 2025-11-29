import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Redirc } from './redirc';

describe('Redirc', () => {
  let component: Redirc;
  let fixture: ComponentFixture<Redirc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Redirc]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Redirc);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
