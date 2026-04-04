import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavService {
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  public isCollapsed$ = this.isCollapsedSubject.asObservable();

  toggleCollapse() {
    this.isCollapsedSubject.next(!this.isCollapsedSubject.value);
  }

  get isCollapsed(): boolean {
    return this.isCollapsedSubject.value;
  }
}