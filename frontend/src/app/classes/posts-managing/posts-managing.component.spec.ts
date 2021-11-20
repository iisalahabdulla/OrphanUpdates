import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostsManagingComponent } from './posts-managing.component';

describe('PostsManagingComponent', () => {
  let component: PostsManagingComponent;
  let fixture: ComponentFixture<PostsManagingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostsManagingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostsManagingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
