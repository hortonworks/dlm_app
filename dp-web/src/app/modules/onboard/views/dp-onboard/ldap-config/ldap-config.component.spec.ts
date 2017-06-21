import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LdapConfigComponent } from './ldap-config.component';

describe('LdapConfigComponent', () => {
  let component: LdapConfigComponent;
  let fixture: ComponentFixture<LdapConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LdapConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LdapConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
