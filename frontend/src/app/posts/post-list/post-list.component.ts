import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { User } from 'src/app/auth/user.model';
import { InfoMessageService } from 'src/app/header/info-message.service';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  private postsSub: Subscription;
  isLoading: boolean = false;
  
  postsCount = 10;  // pagination vars
  postsPerPage = 3;
  pageIndex = 0;
  postsPerPageOptions = [3, 5, 10, 15, 20];
  
  user: User;
  private userSub: Subscription;

  private userIdFilter: string;

  constructor(
    private postsService: PostsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private infoMessageService: InfoMessageService 
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(  // user id filter comes as param query 
      (params) => {
        this.userIdFilter = params.userId;
        this.fetchPosts();
      }
    );

    this.loading();
    this.fetchPosts();
    this.postsSub = this.postsService.posts$.subscribe(
      (postsUpdate: { posts: Post[], postsCount: number }) => {
        this.isLoading = false;
        this.posts = postsUpdate.posts;
        this.postsCount = postsUpdate.postsCount;
      }, (error) => this.isLoading = false );

    this.user = this.authService.user;
    this.userSub = this.authService.user$.subscribe(
      (user) => this.user = user 
    );
  }

  onDeletePost(id: string) {
    this.postsService.deletePost(id).subscribe(() => {  // refetch page on deleting
      this.infoMessageService.show(`Post was deleted`);
      this.loading();
      this.fetchPosts();
    }, (error) => this.isLoading = false);
  }

  onChangePage(pageData: PageEvent) {  // { previousPageIndex, pageIndex, pageSize, length }
    this.pageIndex = pageData.pageIndex;
    this.postsPerPage = pageData.pageSize;
    this.loading();
    this.fetchPosts();
  }

  loading() {
    this.isLoading = true;
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.userSub.unsubscribe();
  }

  fetchPosts() {
    this.postsService.fetchPaginatedPosts(this.postsPerPage, this.pageIndex, this.userIdFilter);
  } 
}
