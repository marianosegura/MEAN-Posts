import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Post } from "./post.model";
import { environment } from '../../environments/environment';
import { InfoMessageService } from "../header/info-message.service";

const SERVER_URL = environment.apiUrl + "/posts/";

@Injectable({ providedIn: "root" })
export class PostsService {
  private posts: Post[] = [];
  private postsCount: number;

  private _posts$ = new Subject<{ posts: Post[], postsCount: number }>();  // posts observable
  private _error$ = new Subject<void>();  // to stop loading

  constructor(
    private http: HttpClient, 
    private router: Router,
    private infoMessageService: InfoMessageService 
  ) { }

  public get posts$() { return this._posts$.asObservable(); }
  public get error$() { return this._error$.asObservable(); }

  fetchPaginatedPosts(pageSize: number, pageIndex: number, userIdFilter: string = null) {
    let queryParams = `?pageSize=${pageSize}&pageIndex=${pageIndex}`;
    if (userIdFilter) {
      queryParams += `&userIdFilter=${userIdFilter}`;
    }

    this.http.get<{ message: String, posts: any, postsCount: number }>(SERVER_URL + queryParams)
      .pipe(map((res) => {
        return {
          posts: res.posts.map((post) => {
            return {
              id: post._id,  // mapping _id -> id to follow Post model
              title: post.title,
              content: post.content,
              imagePath: post.imagePath,
              userId: post.userId,
              username: post.username
            }
          }), 
          postsCount: +res.postsCount
        }
      }))
      .subscribe((postsUpdate) => {
        this.posts = postsUpdate.posts;  // fetched posts
        this.postsCount = postsUpdate.postsCount;
        this.notifyPostsUpdate(); 
      }, (error) => {
        this._error$.next();
      });
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();  // to work with files too
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);  // passing image file

    this.http.post<{ message: string, post: Post, postsCount: number }>(SERVER_URL, postData)
    .subscribe((res) =>  {
        // this.posts.push(res.post);  // locally add post  // local update is useless due to pagination
        // this.postsCount = res.postsCount;
        // this.notifyPostsUpdate(); 
        this.infoMessageService.show(`Post ${title} created!`);
        this.router.navigate(['/']);  // navigate to home
      }, (error) => {
        this._error$.next();
      });
  } 

  deletePost(id: string) {
    return this.http.delete(SERVER_URL + id);  // returnes to subscribe due to pagination
      // .subscribe(() => {  // update locally for optimization (fetching all for one change is inefficient)
      //   this.posts = this.posts.filter((post) => post.id !== id);
      //   this.notifyPostsUpdate(); 
      // }); 
  }

  private notifyPostsUpdate() {
    this._posts$.next({ posts: [...this.posts], postsCount: this.postsCount }); 
  }

  getPost(id: string) {  // fetches from server, returns observable
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, userId: string, username: string }>(SERVER_URL + id)
      .pipe(map((rawPost) => {
        return {
            id: rawPost._id,  // mapping _id -> id to follow Post model
            title: rawPost.title,
            content: rawPost.content,
            imagePath: rawPost.imagePath,
            userId: rawPost.userId,
            username: rawPost.username
        }
      }));
  }

  updatePost(id: string, title: string, content: string, image: File | string) {  // file can be original url or uploaded file
    let postData: FormData | Post;
    if (typeof(image) === 'object') {
      postData = new FormData();  // to work with files too
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
    } else {
      postData = { id, title, content, imagePath: image, userId: null, username: null };  // type Post
    }
    this.http.put<{ message: string, imagePath: string }>(SERVER_URL + id, postData)
      .subscribe((res) => {
        // const postIndex = this.posts.findIndex(p => p.id === id);  // local update is useless due to pagination
        // const updatedPost = { id, title, content, imagePath: res.imagePath };  // creating with image path given back
        // this.posts[postIndex] = updatedPost;  // update locally (even though in post-list are fetch every time)
        // this.notifyPostsUpdate(); 
        this.infoMessageService.show(`Post ${title} updated!`);
        this.router.navigate(['/']);  // navigate to home
      }, (error) => {
        this._error$.next();
      }); 
  }
}