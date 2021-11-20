import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsBoardComponent } from './posts-board.component';

describe('PostsBoardComponent', () => {
  let component: PostsBoardComponent;
  let fixture: ComponentFixture<PostsBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostsBoardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostsBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
