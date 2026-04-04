import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TostNotification } from './tost-notification';

describe('TostNotification', () => {
  let component: TostNotification;
  let fixture: ComponentFixture<TostNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TostNotification]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TostNotification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
